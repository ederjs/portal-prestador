import React from "react";
import { Stethoscope, FlaskConical, BedDouble, CalendarClock, Smile, ArrowRight, type LucideIcon } from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import type { RequisicaoGuiaFormId } from "../types";

interface CardDef {
  id: RequisicaoGuiaFormId;
  label: string;
  description: string;
  icon: LucideIcon;
}

/** Definição única dos 5 atalhos de guia TISS — reaproveitada tanto na
 *  tela "Requisitar guia" quanto no bloco de acesso rápido do Dashboard. */
export const REQUISICAO_GUIA_CARDS: CardDef[] = [
  { id: "consulta", label: "Guia Consulta", description: "Preenchimento e envio de guia de consulta médica.", icon: Stethoscope },
  { id: "spsadt", label: "Guia SP/SADT", description: "Procedimentos ambulatoriais e serviços auxiliares.", icon: FlaskConical },
  { id: "internacao", label: "Guia Internação", description: "Autorização e acompanhamento de internação hospitalar.", icon: BedDouble },
  { id: "prorrogacao", label: "Guia Prorrogação Internação", description: "Solicitação de prorrogação de internação ou tratamento.", icon: CalendarClock },
  { id: "odontologico", label: "Guia Tratamento Odontológico", description: "Registro de procedimentos odontológicos e tratamentos.", icon: Smile },
];

interface RequisicaoGuiaShortcutsProps {
  onSelect: (id: RequisicaoGuiaFormId) => void;
}

interface ShortcutChipProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

/**
 * Chip compacto tipo botão (ícone + label) — usado na linha "Acesso rápido"
 * do Dashboard. Exportado à parte para que o Dashboard possa misturar os
 * atalhos das 5 guias com outros atalhos (ex: "Executar requisição") na
 * mesma fileira.
 */
export function ShortcutChip({ icon: Icon, label, onClick }: ShortcutChipProps) {
  const { theme } = useTheme();
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 pl-2.5 pr-4 py-2 rounded-lg transition-colors hover:opacity-90"
      style={{ backgroundColor: theme.contentCardBg, border: `1px solid ${C.borderSoft}` }}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: C.bronzeSoft }}>
        <Icon size={14} style={{ color: C.bronze }} />
      </div>
      <span className="font-body text-xs font-semibold whitespace-nowrap" style={{ color: theme.textColor }}>
        {label}
      </span>
    </button>
  );
}

/**
 * Grade de cards grandes com as 5 guias TISS — usada na tela "Requisitar
 * guia".
 */
export default function RequisicaoGuiaShortcuts({ onSelect }: RequisicaoGuiaShortcutsProps) {
  const { theme } = useTheme();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {REQUISICAO_GUIA_CARDS.map((card) => (
        <button
          key={card.id}
          onClick={() => onSelect(card.id)}
          className="flex flex-col items-start text-left rounded-xl p-5 h-full transition-transform duration-150 hover:opacity-90 hover:-translate-y-0.5"
          style={{ backgroundColor: theme.contentCardBg, border: `1px solid ${C.borderSoft}` }}
        >
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
            style={{ backgroundColor: C.bronzeSoft }}
          >
            <card.icon size={20} style={{ color: C.bronze }} />
          </div>
          <p className="font-display text-base font-bold leading-snug mb-2" style={{ color: theme.textColor }}>
            {card.label}
          </p>
          <p className="font-body text-xs leading-relaxed flex-1" style={{ color: theme.textColor }}>
            {card.description}
          </p>
          <span
            className="font-body text-xs font-semibold mt-4 inline-flex items-center gap-1"
            style={{ color: C.bronze }}
          >
            Acessar <ArrowRight size={13} />
          </span>
        </button>
      ))}
    </div>
  );
}
