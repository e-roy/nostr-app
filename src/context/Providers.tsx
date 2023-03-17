"use client";

import RelayProvider from "./relay-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <RelayProvider>{children}</RelayProvider>;
}
