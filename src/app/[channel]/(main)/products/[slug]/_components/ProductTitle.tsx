import React from "react";

interface ProductTitleProps {
  name: string | undefined;
  className?: string;
}

export const ProductTitle: React.FC<ProductTitleProps> = ({ 
  name, 
  className = "mb-4 text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight" 
}) => {
  if (!name) return null;
  
  return (
    <h1 className={`${className} break-words leading-tight transition-all duration-200`}>
      {name}
    </h1>
  );
};