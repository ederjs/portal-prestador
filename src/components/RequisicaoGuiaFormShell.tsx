import React, { type ReactNode } from "react";
import { X } from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import Button from "./ui/Button";

interface RequisicaoGuiaFormShellProps {
  title: string;
  onCancel: () => void;
  children?: ReactNode;
}

/**
 * Casca comum para as telas de formulário de guia TISS (Consulta, SP/SADT,
 * Internação, Prorrogação de Internação, Tratamento Odontológico),
 * acessadas a partir dos cards da tela "Requisitar guia".
 *
 * Padroniza o cabeçalho (título + botão "Cancelar" no topo direito, que
 * volta para a tela de cards) para as 5 telas. O conteúdo específico de
 * cada formulário entra via `children` — enquanto a especificação de cada
 * guia não chega, mostra um placeholder.
 */
export default function RequisicaoGuiaFormShell({ title, onCancel, children }: RequisicaoGuiaFormShellProps) {
  const { theme } = useTheme();
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-xl font-bold" style={{ color: theme.textColor }}>
          {title}
        </h1>
        <Button variant="secondary" icon={X} onClick={onCancel} className="shrink-0">
          Cancelar
        </Button>
      </div>

      {children ?? (
        <div
          className="rounded-xl p-10 text-center"
          style={{ backgroundColor: theme.contentCardBg, border: `1px solid ${C.borderSoft}` }}
        >
          <p className="font-body text-sm" style={{ color: theme.textColor }}>
            Formulário em construção — aguardando especificação desta guia TISS.
          </p>
        </div>
      )}
    </div>
  );
}
