import React, { useEffect, useState } from "react";
import { Filter, Search, FileSearch, CreditCard, Calendar, UserSearch } from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import { GUIAS_SOLICITADAS } from "../data/mock";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import DataTable, { type Column } from "../components/ui/DataTable";
import StatusBadge from "../components/StatusBadge";
import LocalizadorBeneficiario from "../components/LocalizadorBeneficiario";
import type { GuiaSolicitada } from "../types";

const PAGE_SIZE = 20;

/** Página "Consultar requisições" (menu Guia TISS) — lista somente leitura
 *  das requisições de guia, com filtros por beneficiário, código e prestador.
 *  Paginada: mostra os 20 primeiros registros e carrega mais 20 por clique. */
export default function ConsultaRequisicoesPage() {
  const { theme } = useTheme();
  const [guias] = useState<GuiaSolicitada[]>(GUIAS_SOLICITADAS);
  const [filtroBeneficiario, setFiltroBeneficiario] = useState("");
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroPrestador, setFiltroPrestador] = useState("todos");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [localizadorAberto, setLocalizadorAberto] = useState(false);

  const prestadoresUnicos = Array.from(new Set(GUIAS_SOLICITADAS.map((g) => g.prestadorNome)));

  const filtradas = guias.filter((g) => {
    const buscaBeneficiario = filtroBeneficiario.trim().toLowerCase();
    const nomeGuia = g.beneficiario.toLowerCase();
    // aceita tanto texto livre digitado (nome contém a busca) quanto o valor
    // "carteirinha - nome" devolvido pelo LocalizadorBeneficiario (busca contém o nome)
    const okBeneficiario = !buscaBeneficiario || nomeGuia.includes(buscaBeneficiario) || buscaBeneficiario.includes(nomeGuia);
    const okCodigo = g.codigo.toLowerCase().includes(filtroCodigo.trim().toLowerCase());
    const okPrestador = filtroPrestador === "todos" || g.prestadorNome === filtroPrestador;
    return okBeneficiario && okCodigo && okPrestador;
  });

  // volta pra 1ª página sempre que o filtro muda
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filtroBeneficiario, filtroCodigo, filtroPrestador]);

  const visiveis = filtradas.slice(0, visibleCount);
  const temMais = visibleCount < filtradas.length;

  const columns: Column<GuiaSolicitada>[] = [
    {
      key: "beneficiario",
      header: "Beneficiário",
      render: (g) => (
        <>
          <p className="font-body text-sm font-medium" style={{ color: theme.textColor }}>{g.beneficiario}</p>
          <p className="font-mono text-[11px] flex items-center gap-1.5 mt-0.5" style={{ color: theme.textColor }}>
            <CreditCard size={11} /> {g.carteirinha}
          </p>
        </>
      ),
    },
    { key: "codigo", header: "Código da guia", mono: true },
    {
      key: "dataSolicitacao",
      header: "Data da solicitação",
      render: (g) => (
        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: theme.textColor }}>
          <Calendar size={12} style={{ color: theme.textColor }} /> {g.dataSolicitacao}
        </span>
      ),
    },
    { key: "prestadorNome", header: "Prestador", render: (g) => <span style={{ color: theme.textColor }}>{g.prestadorNome}</span> },
    { key: "status", header: "Status", render: (g) => <StatusBadge status={g.status} /> },
  ];

  return (
    <div>
      {/* cabeçalho da página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-xl font-bold" style={{ color: theme.textColor }}>
            Consultar requisições
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: theme.textColor }}>
            {visiveis.length} de {filtradas.length} guias solicitadas
          </p>
        </div>
      </div>

      {/* filtros */}
      <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: theme.contentCardBg, border: `1px solid ${C.borderSoft}` }}>
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} style={{ color: theme.textColor }} />
          <span className="font-body text-xs font-semibold uppercase tracking-wide" style={{ color: theme.textColor }}>
            Filtros
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <Input
                icon={Search}
                value={filtroBeneficiario}
                onChange={(e) => setFiltroBeneficiario(e.target.value)}
                placeholder="Buscar por beneficiário"
                bg={theme.contentCardBg}
                textColor={theme.textColor}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="md"
              icon={UserSearch}
              onClick={() => setLocalizadorAberto(true)}
              aria-label="Localizar beneficiário"
              className="shrink-0 px-3"
            />
          </div>
          <Input
            icon={FileSearch}
            value={filtroCodigo}
            onChange={(e) => setFiltroCodigo(e.target.value)}
            placeholder="Buscar por código da guia"
            bg={theme.contentCardBg}
            textColor={theme.textColor}
          />
          <Select
            value={filtroPrestador}
            onChange={(e) => setFiltroPrestador(e.target.value)}
            bg={theme.contentCardBg}
            textColor={theme.textColor}
          >
            <option value="todos">Todos os prestadores</option>
            {prestadoresUnicos.map((nome) => (
              <option key={nome} value={nome}>{nome}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* listagem — tabela no desktop/tablet, cards no mobile (só beneficiário + código) */}
      <DataTable
        columns={columns}
        data={visiveis}
        emptyMessage="Nenhuma guia encontrada para os filtros aplicados."
        renderMobileCard={(g) => (
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="font-body text-sm font-medium truncate" style={{ color: theme.textColor }}>{g.beneficiario}</p>
              <p className="font-mono text-xs mt-0.5" style={{ color: theme.textColor }}>{g.codigo}</p>
            </div>
            <StatusBadge status={g.status} />
          </div>
        )}
      />

      {temMais && (
        <div className="flex justify-center mt-5">
          <Button variant="secondary" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}>
            Carregar mais
          </Button>
        </div>
      )}

      <LocalizadorBeneficiario
        open={localizadorAberto}
        onClose={() => setLocalizadorAberto(false)}
        onSelect={(b) => setFiltroBeneficiario(b.carteiraNome)}
      />
    </div>
  );
}
