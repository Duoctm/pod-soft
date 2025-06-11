import { cn } from "@/lib/utils";
import React from "react";

interface ProductTitleProps {
  name: string | undefined;
  className?: string;
  isLoading?: boolean;
}

export const ProductTitle: React.FC<ProductTitleProps> = ({
  name,
  className,
  isLoading = false
}) => {
  if (isLoading || !name || name === "") {
    return (
      <div className={cn('animate-pulse bg-gray-200 rounded h-8 w-3/4 ', className)} />
    );
  }

  return (
    <h1 className={`${className} break-words leading-tight transition-all duration-200 md:mb-4  text-[32px] lg:text-4xl font-bold tracking-tight`}>
      {name}
    </h1>
  );
};