import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import Stripe from "stripe";

const stripe = env.STRIPE_SECRET_KEY 
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2026-04-22.dahlia" })
  : null;

const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!stripe || !webhookSecret) {
    return new NextResponse("Stripe is not configured", { status: 500 });
  }

  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`⚠️  Webhook signature verification failed.`, errorMessage);
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId && (plan === "PRO" || plan === "ELITE")) {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;
          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id;

          if (!subscriptionId) {
            throw new Error("Checkout session is missing subscription id");
          }

          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const subscriptionWithPeriod = subscription as Stripe.Subscription & {
            current_period_end?: number;
          };
          const currentPeriodEnd = subscriptionWithPeriod.current_period_end
            ? new Date(subscriptionWithPeriod.current_period_end * 1000)
            : new Date();

          await prisma.user.update({
            where: { id: userId },
            data: {
              plan,
              stripeCustomerId: customerId,
              subscription: {
                upsert: {
                  create: {
                    stripeSubscriptionId: subscription.id,
                    plan,
                    status: subscription.status,
                    currentPeriodEnd,
                  },
                  update: {
                    stripeSubscriptionId: subscription.id,
                    plan,
                    status: subscription.status,
                    currentPeriodEnd,
                  },
                },
              },
            },
          });
          console.log(`Successfully upgraded user ${userId} to ${plan}`);
        }
        break;

      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: subscription.status },
        });
        await prisma.user.updateMany({
          where: { subscription: { stripeSubscriptionId: subscription.id } },
          data: { plan: "FREE" },
        });
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[WEBHOOK_ERROR]", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
