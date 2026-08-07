import React from "react";
import { STATUS_MAP } from "../data/mock";
import type { GuiaStatus } from "../types";

interface StatusBadgeProps {
  status: GuiaStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const s = STATUS_MAP[status];
  return (
    <span
      className="font-body inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}
