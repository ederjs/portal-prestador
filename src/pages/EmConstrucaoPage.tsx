import React from "react";
import { Construction } from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";

interface EmConstrucaoPageProps {
  /** Label do item de menu selecionado (ex: "Consultar guias executadas"),
   *  exibido na mensagem para deixar claro qual tela ainda falta. */
  label?: string;
}

/**
 * Placeholder para qualquer opção do menu esquerdo que ainda não tem tela
 * própria — em vez de cair no Dashboard silenciosamente, mostra um aviso
 * claro de "Em construção" com o nome da tela pendente.
 */
export default function EmConstrucaoPage({ label }: EmConstrucaoPageProps) {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-5 animate-pulse"
        style={{ backgroundColor: C.bronzeSoft }}
      >
        <Construction size={36} style={{ color: C.bronze }} />
      </div>
      <h1 className="font-display text-lg font-bold mb-1.5" style={{ color: theme.textColor }}>
        Em construção
      </h1>
      <p className="font-body text-sm max-w-sm" style={{ color: theme.textColor }}>
        {label ? (
          <>A tela <span style={{ fontWeight: 600 }}>{label}</span> ainda está sendo desenvolvida.</>
        ) : (
          "Esta tela ainda está sendo desenvolvida."
        )}{" "}
        Volte em breve.
      </p>
    </div>
  );
}
