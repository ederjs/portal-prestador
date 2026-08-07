import React from "react";
import { useTheme } from "../theme/ThemeContext";
import RequisicaoGuiaShortcuts from "../components/RequisicaoGuiaShortcuts";
import type { RequisicaoGuiaFormId } from "../types";

export type { RequisicaoGuiaFormId };

interface RequisitarGuiaPageProps {
  onSelect: (id: RequisicaoGuiaFormId) => void;
}

/** Tela "Requisitar guia" (menu Guia TISS) — hub de cards que leva a cada
 *  formulário específico de guia TISS. */
export default function RequisitarGuiaPage({ onSelect }: RequisitarGuiaPageProps) {
  const { theme } = useTheme();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold" style={{ color: theme.textColor }}>
          Requisitar guia
        </h1>
        <p className="font-body text-sm mt-1" style={{ color: theme.textColor }}>
          Selecione o tipo de guia TISS que deseja requisitar
        </p>
      </div>

      <RequisicaoGuiaShortcuts onSelect={onSelect} />
    </div>
  );
}
