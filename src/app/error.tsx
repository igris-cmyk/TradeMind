"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4">
      <div className="flex max-w-md flex-col items-center text-center space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-red/10">
          <AlertTriangle className="h-10 w-10 text-accent-red" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter">Something went wrong</h1>
          <p className="text-muted-foreground">
            A critical error occurred while trying to render this page. Our team has been notified.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button variant="outline">
              Return to Dashboard
            </Button>
          </Link>
        </div>
        
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 rounded-md bg-muted p-4 text-left w-full overflow-auto max-h-[300px]">
            <p className="font-mono text-sm text-red-400">{error.message}</p>
            {error.stack && (
              <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
