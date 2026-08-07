import React, { type SelectHTMLAttributes } from "react";
import { C } from "../../theme/colors";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  bg?: string;
  textColor?: string;
}

/**
 * Select genérico do design system — mesma casca visual do Input,
 * usado em filtros e formulários.
 */
export default function Select({ bg, textColor, className = "", children, ...rest }: SelectProps) {
  return (
    <select
      className={`font-body px-3.5 py-1.5 rounded-lg text-sm outline-none ${className}`}
      style={{ backgroundColor: bg ?? C.bgPanelAlt, border: `1px solid ${C.border}`, color: textColor ?? C.textPrimary }}
      {...rest}
    >
      {children}
    </select>
  );
}
