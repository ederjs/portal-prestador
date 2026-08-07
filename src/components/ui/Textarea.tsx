import React, { type TextareaHTMLAttributes } from "react";
import { C } from "../../theme/colors";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  bg?: string;
  textColor?: string;
}

export default function Textarea({ bg, textColor, className = "", ...rest }: TextareaProps) {
  return (
    <textarea
      className={`font-body w-full px-3.5 py-1.5 rounded-lg text-sm outline-none resize-none ${className}`}
      style={{ backgroundColor: bg ?? C.bgPanelAlt, border: `1px solid ${C.border}`, color: textColor ?? C.textPrimary }}
      {...rest}
    />
  );
}
