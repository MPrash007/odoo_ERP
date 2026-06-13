import { cn } from "@/lib/utils";

type StatusType =
  | "DRAFT"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "PARTIALLY_DELIVERED"
  | "PARTIALLY_RECEIVED"
  | "DELIVERED"
  | "RECEIVED"
  | "COMPLETED"
  | "CANCELLED"
  | "PENDING"
  | "READY"
  | "PAUSED"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED";

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  DRAFT: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
  CONFIRMED: {
    bg: "bg-[#820AD1]/10",
    text: "text-[#820AD1]",
    dot: "bg-[#820AD1]",
  },
  IN_PROGRESS: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  PARTIALLY_DELIVERED: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  PARTIALLY_RECEIVED: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  DELIVERED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  RECEIVED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  COMPLETED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  PENDING: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
  READY: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  PAUSED: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  ACTIVE: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  INACTIVE: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
  SUSPENDED: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.DRAFT;
  const displayLabel =
    label || status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        style.bg,
        style.text,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
      {displayLabel}
    </span>
  );
}
