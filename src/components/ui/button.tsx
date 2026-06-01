import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { tap, spring } from "@/lib/motion";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-600 shadow-elevation-1 hover:shadow-glow-sm",
        destructive:
          "bg-accent-red text-white hover:bg-rose-600 shadow-elevation-1 hover:shadow-glow-red",
        outline:
          "border border-border bg-transparent hover:bg-white/[0.03] text-foreground hover:border-white/[0.12]",
        secondary:
          "bg-white/[0.04] text-foreground hover:bg-white/[0.08] border border-white/[0.06]",
        ghost:
          "hover:bg-white/[0.04] text-muted-foreground hover:text-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        success:
          "bg-accent-green text-white hover:bg-emerald-600 shadow-elevation-1 hover:shadow-glow-green",
        glow:
          "bg-gradient-to-r from-primary to-primary-600 text-white shadow-glow hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:from-primary-400 hover:to-primary-500",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        xl: "h-12 rounded-xl px-10 text-base font-semibold",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }
    return (
      <motion.button
        whileTap={disabled || loading ? undefined : tap.press}
        transition={spring.snappy}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading ? (
          <>
            <span className="mr-2 h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
