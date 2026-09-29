"use client";

import { TradingProvider } from "@/context/TradingContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <TradingProvider>{children}</TradingProvider>;
}
