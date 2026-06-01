import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";

import Stripe from "stripe";

// We instantiate Stripe only if the secret key is provided
const stripe = env.STRIPE_SECRET_KEY 
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2026-04-22.dahlia" })
  : null;

const PRICING = {
  PRO: env.STRIPE_PRICE_PRO,
  ELITE: env.STRIPE_PRICE_ELITE,
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!["FREE", "PRO", "ELITE"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (plan === "FREE") {
      return NextResponse.json(
        { error: "Plan downgrades require billing portal support" },
        { status: 501 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Billing is not configured" },
        { status: 503 }
      );
    }

    const priceId = PRICING[plan as keyof typeof PRICING];
    if (!priceId) {
      return NextResponse.json(
        { error: "Billing price is not configured" },
        { status: 503 }
      );
    }

    // Create a Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${env.NEXTAUTH_URL}/settings/pricing?canceled=true`,
      client_reference_id: session.user.id,
      customer_email: session.user.email || undefined,
      metadata: {
        userId: session.user.id,
        plan,
      },
    });

    return NextResponse.json({ success: true, url: checkoutSession.url });
  } catch (error) {
    console.error("[CHECKOUT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
