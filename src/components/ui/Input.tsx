import React, { type InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { C } from "../../theme/colors";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  bg?: string;
  textColor?: string;
  /** usa fonte monoespaçada (IBM Plex Mono) — para códigos, números de guia, CNPJ etc. */
  mono?: boolean;
}

/**
 * Input genérico do design system — usado em filtros, formulários e busca.
 * icon: componente lucide-react opcional, exibido à esquerda.
 * bg / textColor: cores customizadas (ex: para acompanhar o cartão do tema do cliente).
 */
export default function Input({ icon: Icon, bg, textColor, mono = false, className = "", ...rest }: InputProps) {
  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg ${className}`}
      style={{ backgroundColor: bg ?? C.bgPanelAlt, border: `1px solid ${C.border}` }}
    >
      {Icon && <Icon size={15} className="shrink-0" style={{ color: textColor ?? C.textFaint }} />}
      <input
        className={`${mono ? "font-mono" : "font-body"} bg-transparent outline-none text-sm w-full`}
        style={{ color: textColor ?? C.textPrimary }}
        {...rest}
      />
    </div>
  );
}
