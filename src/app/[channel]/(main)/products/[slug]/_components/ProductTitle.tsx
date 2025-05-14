import React from "react";

interface ProductTitleProps {
  name: string | undefined;
  className?: string;
  isLoading?: boolean;
}

export const ProductTitle: React.FC<ProductTitleProps> = ({ 
  name, 
  className = "mb-4 text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight",
  isLoading = false
}) => {
  if (isLoading || !name || name === "") {
    return (
      <div className={`${className} animate-pulse bg-gray-200 rounded h-8 w-3/4`} />
    );
  }
  
  return (
    <h1 className={`${className} break-words leading-tight transition-all duration-200`}>
      {name}
    </h1>
  );
};