'use client';

import { Provider } from "urql";
import { type ReactNode } from "react";
import { urqlClient } from "@/lib/urql-client";

export function UrqlProvider({ children }: { children: ReactNode }) {
  return <Provider value={urqlClient}>{children}</Provider>;
} 