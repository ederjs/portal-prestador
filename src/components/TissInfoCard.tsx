import React, { useState } from "react";
import { ChevronDown, Mail, Phone, Link2 } from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import type { TissInfo } from "../types";

interface TissInfoCardProps {
  info: TissInfo;
}

/**
 * Card "Informações TISS" do Dashboard — coordenadores/suplente de TISS,
 * links de referência do padrão e endereços dos webservices. Colapsável
 * pelo botão no canto superior direito (o conteúdo some, só o título fica
 * visível), útil para quem só precisa consultar de vez em quando.
 */
export default function TissInfoCard({ info }: TissInfoCardProps) {
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const contatoRow = (c: { nome: string; email: string; telefone: string }, key: string | number) => (
    <div key={key} className="rounded-lg px-3 py-2.5 space-y-1" style={{ backgroundColor: C.bgPanelAlt }}>
      <p className="font-body text-sm font-semibold" style={{ color: theme.textColor }}>{c.nome}</p>
      <p className="font-body text-xs flex items-center gap-1.5" style={{ color: theme.textColor }}>
        <Mail size={12} className="shrink-0" /> {c.email}
      </p>
      <p className="font-mono text-xs flex items-center gap-1.5" style={{ color: theme.textColor }}>
        <Phone size={12} className="shrink-0" /> {c.telefone}
      </p>
    </div>
  );

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: theme.contentCardBg, border: `1px solid ${C.borderSoft}` }}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-bold" style={{ color: theme.textColor }}>Informações TISS</h2>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: theme.headerControlBg, color: theme.textColor }}
          aria-label={collapsed ? "Expandir Informações TISS" : "Recolher Informações TISS"}
        >
          <ChevronDown size={14} style={{ transform: collapsed ? "rotate(-90deg)" : "none", transition: "transform 0.2s" }} />
        </button>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* coordenadores */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: theme.textColor }}>
              Coordenadores TISS
            </p>
            <div className="space-y-2">
              {info.coordenadores.map((c, i) => contatoRow(c, i))}
            </div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-wide mt-3 mb-2" style={{ color: theme.textColor }}>
              Suplente
            </p>
            {contatoRow(info.suplente, "suplente")}
          </div>

          {/* links */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: theme.textColor }}>
              Links sobre TISS
            </p>
            <ul className="space-y-2">
              {info.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.url}
                    className="font-body text-xs inline-flex items-center gap-1.5 hover:underline"
                    style={{ color: C.bronze }}
                  >
                    <Link2 size={12} className="shrink-0" /> {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* webservices */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: theme.textColor }}>
              Webservices
            </p>
            <div className="space-y-2">
              {info.webservices.map((w) => (
                <div key={w.descricao} className="rounded-lg px-3 py-2.5" style={{ backgroundColor: C.bgPanelAlt }}>
                  <p className="font-mono text-xs font-semibold" style={{ color: theme.textColor }}>{w.descricao}</p>
                  <p className="font-mono text-[11px] break-all mt-1" style={{ color: theme.textColor }}>{w.endereco}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
