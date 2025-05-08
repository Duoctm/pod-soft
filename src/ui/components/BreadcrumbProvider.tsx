"use client";

import { createContext, useContext, useState, type Dispatch, type SetStateAction, type ReactNode } from "react";
import { Breadcrumb } from "@/ui/components/Breadcrumb";

// Tạo context để lưu trạng thái breadcrumb
const BreadcrumbContext = createContext<{
  setBreadcrumb: Dispatch<SetStateAction<ReactNode>>;
}>({ setBreadcrumb: () => {} });

// Hook để sử dụng context trong các component con
export const useBreadcrumb = () => useContext(BreadcrumbContext);

interface BreadcrumbProviderProps {
  children: ReactNode;
  channel: string;
}

export function BreadcrumbProvider({ children, channel }: BreadcrumbProviderProps) {
  const [breadcrumb, setBreadcrumb] = useState<ReactNode>(null);

  return (
    <BreadcrumbContext.Provider value={{ setBreadcrumb }}>
      {breadcrumb == null && <Breadcrumb channel={channel} />}
      {breadcrumb != null && children && breadcrumb }
      {children}
    </BreadcrumbContext.Provider>
    
  );
}
