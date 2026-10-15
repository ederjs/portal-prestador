import React, { useEffect, useState } from "react";
import { Megaphone, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import type { Alerta } from "../types";

interface AlertaLoginModalProps {
  open: boolean;
  alertas: Alerta[];
  /** chamado só depois que o usuário confirmar a leitura de todos os alertas */
  onFinish: () => void;
}

/**
 * Modal obrigatório exibido no centro da tela ao fazer login, com os
 * alertas ativos e dentro da vigência (ver ALERTAS/adicionarAlerta em
 * data/mock.ts). Não tem botão de fechar nem fecha ao clicar fora — só é
 * dispensado depois que o usuário confirmar a leitura de cada alerta. Se
 * houver mais de um, uma navegação (Anterior/Próximo + indicadores) deixa
 * percorrer todos antes de liberar o botão "Fechar".
 */
export default function AlertaLoginModal({ open, alertas, onFinish }: AlertaLoginModalProps) {
  const { theme } = useTheme();
  const [index, setIndex] = useState(0);
  const [confirmados, setConfirmados] = useState<Set<number>>(new Set());

  // sempre que a modal abre com uma nova leva de alertas, reseta o progresso
  useEffect(() => {
    if (open) {
      setIndex(0);
      setConfirmados(new Set());
    }
  }, [open]);

  if (!open || alertas.length === 0) return null;

  const atual = alertas[index];
  const atualConfirmado = confirmados.has(atual.id);
  const todosConfirmados = alertas.every((a) => confirmados.has(a.id));

  const handleConfirmarLeitura = () => {
    setConfirmados((prev) => {
      const next = new Set(prev);
      next.add(atual.id);
      return next;
    });
    if (index < alertas.length - 1) {
      setIndex(index + 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(6,13,26,0.75)" }}
    >
      <div
        className="w-full max-w-xl rounded-xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: theme.contentCardBg,
          border: `1px solid ${C.border}`,
          // altura fixa (não só max-height) — o tamanho da modal não muda
          // conforme o texto do alerta é maior ou menor; o conteúdo rola
          // internamente quando necessário
          height: "640px",
          maxHeight: "85vh",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ backgroundColor: C.bronzeSoft }}>
          <div className="flex items-center gap-2.5">
            <Megaphone size={18} style={{ color: C.bronze }} />
            <h2 className="font-display text-sm font-bold" style={{ color: C.bronze }}>
              Aviso importante
            </h2>
          </div>
          {alertas.length > 1 && (
            <span className="font-body text-xs font-semibold" style={{ color: C.bronze }}>
              Alerta {index + 1} de {alertas.length}
            </span>
          )}
        </div>

        <div className="px-5 py-5 overflow-y-auto flex-1">
          <h3 className="font-display text-base font-bold mb-2.5" style={{ color: theme.textColor }}>
            {atual.titulo}
          </h3>
          <p className="font-body text-sm whitespace-pre-wrap leading-relaxed" style={{ color: theme.textColor }}>
            {atual.descricao}
          </p>
        </div>

        <div className="px-5 py-4 shrink-0" style={{ borderTop: `1px solid ${C.borderSoft}` }}>
          {alertas.length > 1 && (
            <div className="flex items-center justify-center gap-2 mb-3">
              {alertas.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Ir para alerta ${i + 1}`}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: i === index ? C.bronze : confirmados.has(a.id) ? C.tealSoft : C.bgPanelAlt,
                    border: `1px solid ${i === index ? C.bronze : confirmados.has(a.id) ? C.teal : C.borderSoft}`,
                  }}
                >
                  {confirmados.has(a.id) ? (
                    <Check size={12} style={{ color: i === index ? C.bgBase : C.teal }} />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: i === index ? C.bgBase : C.textFaint }} />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            {alertas.length > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={index === 0}
                  className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: theme.headerControlBg, border: `1px solid ${C.border}` }}
                  aria-label="Alerta anterior"
                >
                  <ChevronLeft size={15} style={{ color: theme.textColor }} />
                </button>
                <button
                  onClick={() => setIndex((i) => Math.min(alertas.length - 1, i + 1))}
                  disabled={index === alertas.length - 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: theme.headerControlBg, border: `1px solid ${C.border}` }}
                  aria-label="Próximo alerta"
                >
                  <ChevronRight size={15} style={{ color: theme.textColor }} />
                </button>
              </div>
            ) : (
              <span />
            )}

            {!atualConfirmado ? (
              <button
                onClick={handleConfirmarLeitura}
                className="font-body inline-flex items-center gap-2 rounded-lg font-semibold px-4 py-2.5 text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: C.bronze, color: C.bgBase }}
              >
                <Check size={15} /> Li e estou ciente
              </button>
            ) : todosConfirmados ? (
              <button
                onClick={onFinish}
                className="font-body inline-flex items-center gap-2 rounded-lg font-semibold px-4 py-2.5 text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: C.bronze, color: C.bgBase }}
              >
                Fechar
              </button>
            ) : (
              <span
                className="font-body inline-flex items-center gap-2 rounded-lg font-semibold px-4 py-2.5 text-sm"
                style={{ backgroundColor: C.tealSoft, color: C.teal }}
              >
                <Check size={15} /> Lido
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
