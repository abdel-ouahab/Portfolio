"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-28 sm:px-8">
      <h1 className="text-title font-semibold">This page failed to load</h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
        Something went wrong while rendering it. Try loading it again.
      </p>
      <Button onClick={() => retry()} className="mt-8">
        Try again
      </Button>
    </div>
  );
}
