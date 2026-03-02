"use client";

import { LoadingProvider, useSiteLoading } from "@/lib/loading-context";
import { SiteLoader } from "./SiteLoader";

function SiteLoaderGate({ children }: { children: React.ReactNode }) {
  const { loading } = useSiteLoading();
  return (
    <>
      {loading && <SiteLoader />}
      {children}
    </>
  );
}

export function SiteLoaderProvider({ children }: { children: React.ReactNode }) {
  return (
    <LoadingProvider>
      <SiteLoaderGate>{children}</SiteLoaderGate>
    </LoadingProvider>
  );
}
