"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const CONVERGE_PUBLIC_TOKEN = "La-Nm_";

declare global {
  interface Window {
    cvg: ((...args: unknown[]) => void) & { queue?: unknown[][]; process?: (...args: unknown[]) => void };
  }
}

export function ConvergePixel() {
  const pathname = usePathname();

  // Fire $page_load on route changes (SPA navigation)
  useEffect(() => {
    if (typeof window !== "undefined" && window.cvg) {
      window.cvg({ method: "track", eventName: "$page_load" });
    }
  }, [pathname]);

  if (!CONVERGE_PUBLIC_TOKEN) return null;

  return (
    <>
      <Script
        src={`https://static.runconverge.com/pixels/${CONVERGE_PUBLIC_TOKEN}.js`}
        strategy="afterInteractive"
      />
      <Script id="converge-init" strategy="afterInteractive">
        {`
          window.cvg||(c=window.cvg=function(){c.process?c.process.apply(c,arguments):c.queue.push(arguments)},c.queue=[]);
          cvg({method:"track",eventName:"$page_load"});
        `}
      </Script>
    </>
  );
}

// Helper to track custom events from anywhere
export function trackConvergeEvent(
  eventName: string,
  properties?: Record<string, unknown>,
  profileProperties?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && window.cvg) {
    const payload: Record<string, unknown> = { method: "track", eventName };
    if (properties) payload.properties = properties;
    if (profileProperties) payload.profileProperties = profileProperties;
    window.cvg(payload);
  }
}
