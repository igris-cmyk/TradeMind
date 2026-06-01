"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const routes: Record<string, string> = {
  "1": "/dashboard",
  "2": "/trades",
  "3": "/analytics",
  "4": "/journal",
  "5": "/psychology",
  "6": "/strategies",
};

export function useKeyboardNav() {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        router.push("/trades/new");
        return;
      }
      if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        document.getElementById("journal-quick-trigger")?.click();
        return;
      }

      const route = routes[e.key];
      if (route) {
        e.preventDefault();
        router.push(route);
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [router]);
}
