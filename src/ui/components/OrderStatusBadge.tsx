import React from "react";
import clsx from "clsx";

type PaymentStatus = "NOT_CHARGED" | "FULLY_CHARGED" | "PARTIALLY_CHARGED" | "PARTIALLY_REFUNDED" | "FULLY_REFUNDED" | "REFUSED" | "CANCELLED" | string;

interface OrderStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export const OrderStatusBadge = ({ status, className }: OrderStatusBadgeProps) => {
  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case "FULLY_CHARGED":
        return { label: "Paid", bgColor: "bg-green-100", textColor: "text-green-800" };
      case "PARTIALLY_CHARGED":
        return { label: "Partially Paid", bgColor: "bg-blue-100", textColor: "text-blue-800" };
      case "PARTIALLY_REFUNDED":
        return { label: "Partially Refunded", bgColor: "bg-yellow-100", textColor: "text-yellow-800" };
      case "FULLY_REFUNDED":
        return { label: "Refunded", bgColor: "bg-gray-100", textColor: "text-gray-800" };
      case "REFUSED":
        return { label: "Refused", bgColor: "bg-red-100", textColor: "text-red-800" };
      case "CANCELLED":
        return { label: "Cancelled", bgColor: "bg-red-100", textColor: "text-red-800" };
      case "NOT_CHARGED":
      default:
        return { label: "Unpaid", bgColor: "bg-yellow-100", textColor: "text-yellow-800" };
    }
  };

  const { label, bgColor, textColor } = getStatusConfig(status);

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        bgColor,
        textColor,
        className
      )}
    >
      {label}
    </span>
  );
};