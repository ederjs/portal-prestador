import React from "react";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
  deltaType?: "up" | "down";
  accent: string;
}

export default function KpiCard({ icon: Icon, label, value, delta, deltaType, accent }: KpiCardProps) {
  const { theme } = useTheme();
  return (
    <div
      className="relative rounded-xl p-5 overflow-hidden"
      style={{ backgroundColor: theme.contentCardBg, border: `1px solid ${C.borderSoft}` }}
    >
      <div className="absolute top-0 left-0 w-full h-0.5" style={{ backgroundColor: accent }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="font-body text-xs mb-2" style={{ color: theme.textColor }}>
            {label}
          </p>
          <p className="font-display text-2xl font-bold" style={{ color: theme.textColor }}>
            {value}
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accent}22` }}
        >
          <Icon size={18} style={{ color: accent }} />
        </div>
      </div>
      {delta && (
        <div className="flex items-center gap-1 mt-3 font-body text-xs" style={{ color: deltaType === "up" ? C.teal : C.coral }}>
          {deltaType === "up" ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {delta}
        </div>
      )}
    </div>
  );
}