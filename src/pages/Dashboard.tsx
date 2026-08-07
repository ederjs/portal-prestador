import React from "react";
import { Clock, Check, UploadCloud, AlertTriangle, ListChecks } from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import { PRESTADORES, TISS_INFO } from "../data/mock";
import KpiCard from "../components/KpiCard";
import { REQUISICAO_GUIA_CARDS, ShortcutChip } from "../components/RequisicaoGuiaShortcuts";
import TissInfoCard from "../components/TissInfoCard";
import type { Prestador, RequisicaoGuiaFormId } from "../types";

interface DashboardProps {
  provider: Prestador;
  onOpenGuiaForm: (id: RequisicaoGuiaFormId) => void;
  onOpenExecutarRequisicao: () => void;
}

export default function Dashboard({ provider, onOpenGuiaForm, onOpenExecutarRequisicao }: DashboardProps) {
  const { theme } = useTheme();

  return (
    <>
      {/* boas-vindas */}
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold" style={{ color: theme.textColor }}>
          Olá, Renata 👋
        </h1>
        <p className="font-body text-sm mt-1" style={{ color: theme.textColor }}>
          Você está visualizando dados de <span style={{ color: C.bronze, fontWeight: 600 }}>{provider.nome}</span> · atualizado às 09:42
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <KpiCard icon={Clock} label="Guias em análise" value="18" delta="+3 desde ontem" deltaType="up" accent={C.amber} />
        <KpiCard icon={Check} label="Autorizadas hoje" value="42" delta="+12% na semana" deltaType="up" accent={C.teal} />
        <KpiCard icon={UploadCloud} label="Produção enviada (mês)" value="R$ 184.2K" delta="+8% vs. mês anterior" deltaType="up" accent={C.bronze} />
        <KpiCard icon={AlertTriangle} label="Glosas em aberto" value="6" delta="-2 desde ontem" deltaType="down" accent={C.coral} />
      </div>

      {/* acesso rápido às guias TISS — chips compactos, 2ª linha */}
      <div className="mb-6">
        <h2 className="font-display text-sm font-bold mb-3" style={{ color: theme.textColor }}>
          Acesso rápido
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {REQUISICAO_GUIA_CARDS.map((card) => (
            <ShortcutChip key={card.id} icon={card.icon} label={card.label} onClick={() => onOpenGuiaForm(card.id)} />
          ))}
          <ShortcutChip icon={ListChecks} label="Executar requisição" onClick={onOpenExecutarRequisicao} />
        </div>
      </div>

      {/* meus dados — 3º bloco, largura total */}
      <div className="rounded-xl p-5 mb-5" style={{ backgroundColor: theme.contentCardBg, border: `1px solid ${C.borderSoft}` }}>
        <h2 className="font-display text-sm font-bold mb-4" style={{ color: theme.textColor }}>Meus dados</h2>

        <div className="flex flex-col lg:flex-row lg:items-start gap-5 lg:gap-8">
          {/* avatar + identificação + último acesso */}
          <div className="lg:w-60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-display text-sm font-bold shrink-0" style={{ backgroundColor: C.bronze, color: C.bgBase }}>
                RC
              </div>
              <div className="min-w-0">
                <p className="font-body text-sm font-semibold truncate" style={{ color: theme.textColor }}>Renata Camargo</p>
                <p className="font-body text-xs truncate" style={{ color: theme.textColor }}>renata.camargo@hospital.com.br</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="font-body text-xs mb-1" style={{ color: theme.textColor }}>Último acesso</p>
              <p className="font-body text-sm font-semibold" style={{ color: theme.textColor }}>Hoje, 08:31</p>
            </div>
          </div>

          {/* divisor vertical — só em telas lg+ */}
          <div className="hidden lg:block w-px self-stretch" style={{ backgroundColor: C.borderSoft }} />

          {/* campos em grade — aproveita a largura total do bloco */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <p className="font-body text-xs mb-1" style={{ color: theme.textColor }}>Perfil</p>
              <p className="font-body text-sm font-semibold" style={{ color: theme.textColor }}>Analista administrativo</p>
            </div>
            <div>
              <p className="font-body text-xs mb-1" style={{ color: theme.textColor }}>Tipo de Vínculo</p>
              <p className="font-body text-sm font-semibold" style={{ color: theme.textColor }}>{provider.tipoVinculo}</p>
            </div>
            <div>
              <p className="font-body text-xs mb-1" style={{ color: theme.textColor }}>Prestador ativo</p>
              <p className="font-body text-sm font-semibold truncate" style={{ color: theme.textColor }}>{provider.nome}</p>
            </div>
            <div>
              <p className="font-body text-xs mb-1" style={{ color: theme.textColor }}>Telefone</p>
              <p className="font-mono text-sm font-semibold" style={{ color: theme.textColor }}>{provider.telefone}</p>
            </div>
            <div>
              <p className="font-body text-xs mb-1" style={{ color: theme.textColor }}>Endereço</p>
              <p className="font-body text-sm font-semibold" style={{ color: theme.textColor }}>{provider.endereco}</p>
            </div>
            <div>
              <p className="font-body text-xs mb-1" style={{ color: theme.textColor }}>Prestadores vinculados</p>
              <p className="font-body text-sm font-semibold" style={{ color: theme.textColor }}>{PRESTADORES.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* informações TISS — 4º bloco, largura total (espaço para crescer no futuro) */}
      <TissInfoCard info={TISS_INFO} />
    </>
  );
}
