import React, { type ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { C } from "../../theme/colors";

/**
 * Botão genérico do design system. Todo botão do app deve passar por aqui —
 * trocar cor/raio/peso de fonte de botões vira uma edição neste arquivo só.
 */
type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  bg?: string;
  textColor?: string;
}

const VARIANTS: Record<Variant, { bg: string; color: string; border: string }> = {
  primary: { bg: C.bronze, color: C.bgBase, border: "transparent" },
  secondary: { bg: C.bgPanelAlt, color: C.textMuted, border: C.border },
  ghost: { bg: "transparent", color: C.textMuted, border: "transparent" },
  danger: { bg: C.coralSoft, color: C.coral, border: "transparent" },
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  bg,
  textColor,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const v = VARIANTS[variant];
  const sizeClasses = SIZES[size];

  return (
    <button
      className={`font-body inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${fullWidth ? "w-full" : ""} ${className}`}
      style={{ backgroundColor: bg ?? v.bg, color: textColor ?? v.color, border: `1px solid ${v.border}` }}
      {...rest}
    >
      {Icon && iconPosition === "left" && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
      {Icon && iconPosition === "right" && <Icon size={size === "sm" ? 14 : 16} />}
    </button>
  );
}
