import React, { useState } from "react";
import { X, Search, Check } from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import { PRESTADORES } from "../data/mock";
import Input from "./ui/Input";
import type { Prestador } from "../types";

interface ProviderModalProps {
  open: boolean;
  onClose: () => void;
  current: Prestador;
  onSelect: (p: Prestador) => void;
}

/* Modal de seleção de prestador — com busca, pensado para listas grandes (50+). */
export default function ProviderModal({ open, onClose, current, onSelect }: ProviderModalProps) {
  const { theme } = useTheme();
  const [term, setTerm] = useState("");

  if (!open) return null;

  const filtered = PRESTADORES.filter((p) => {
    const q = term.trim().toLowerCase();
    if (!q) return true;
    return (
      p.nome.toLowerCase().includes(q) ||
      p.cnpj.toLowerCase().includes(q) ||
      p.cidade.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "rgba(6,13,26,0.65)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mt-16 sm:mt-0 rounded-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: theme.contentCardBg, border: `1px solid ${C.border}`, maxHeight: "80vh", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
          <div>
            <h2 className="font-display text-sm font-bold" style={{ color: theme.textColor }}>
              Selecionar prestador
            </h2>
            <p className="font-body text-xs mt-0.5" style={{ color: theme.textColor }}>
              {PRESTADORES.length} prestadores vinculados ao seu login
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.headerControlBg }} aria-label="Fechar">
            <X size={16} style={{ color: theme.textColor }} />
          </button>
        </div>

        <div className="px-5 py-3 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
          <Input
            autoFocus
            icon={Search}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar por nome, cidade ou CNPJ..."
            bg={theme.contentCardBg}
            textColor={theme.textColor}
          />
        </div>

        <div className="overflow-y-auto flex-1">
          {filtered.length === 0 && (
            <p className="font-body text-sm text-center py-10" style={{ color: theme.textColor }}>
              Nenhum prestador encontrado para "{term}".
            </p>
          )}
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onSelect(p);
                onClose();
              }}
              className="w-full flex items-center justify-between gap-2 px-5 py-3 text-left transition-colors"
              style={{ backgroundColor: p.id === current.id ? C.bronzeSoft : "transparent" }}
            >
              <div className="min-w-0">
                <p className="font-body text-sm font-medium truncate" style={{ color: theme.textColor }}>
                  {p.nome}
                </p>
                <p className="font-body text-xs" style={{ color: theme.textColor }}>
                  {p.cidade} · <span className="font-mono">{p.cnpj}</span>
                </p>
              </div>
              {p.id === current.id && <Check size={16} className="shrink-0" style={{ color: C.bronze }} />}
            </button>
          ))}
        </div>

        <div className="px-5 py-2.5 shrink-0 font-body text-xs" style={{ borderTop: `1px solid ${C.borderSoft}`, color: theme.textColor }}>
          {filtered.length} de {PRESTADORES.length} resultados
        </div>
      </div>
    </div>
  );
}
