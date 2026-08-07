import React, { useState } from "react";
import { ListChecks, Check, RefreshCw, UserSearch } from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import { PRESTADORES } from "../data/mock";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import DataTable, { type Column } from "../components/ui/DataTable";
import LocalizadorBeneficiario from "../components/LocalizadorBeneficiario";

interface ItemExecucao {
  id: number;
  codigo: string;
  descricao: string;
  quantidadeSolicitada: number;
}

// motivos de ausência de senha/token — tabela padrão TISS (03.11)
const MOTIVOS_AUSENCIA_TOKEN = [
  { codigo: "01", descricao: "Beneficiário internado" },
  { codigo: "02", descricao: "Beneficiário em situação de urgência/emergência" },
  { codigo: "03", descricao: "Intermitência/Instabilidade de sistemas e regularização do atendimento após saída do beneficiário do prestador de serviço" },
  { codigo: "04", descricao: "Beneficiário se negou a transmitir o número do token" },
  { codigo: "05", descricao: "Beneficiário em coleta domiciliar" },
  { codigo: "06", descricao: "Material para exames enviado ao prestador por terceiros" },
  { codigo: "07", descricao: "Beneficiário não possui celular" },
];

// mock — itens de procedimentos/materiais devolvidos ao carregar uma requisição
const ITENS_MOCK: ItemExecucao[] = [
  { id: 1, codigo: "10101012", descricao: "Consulta em consultório (na especialidade)", quantidadeSolicitada: 1 },
  { id: 2, codigo: "31602018", descricao: "Curativo especial", quantidadeSolicitada: 2 },
  { id: 3, codigo: "40304361", descricao: "Fio de sutura poliéster", quantidadeSolicitada: 4 },
  { id: 4, codigo: "20103035", descricao: "Retirada de pontos", quantidadeSolicitada: 1 },
  { id: 5, codigo: "40101015", descricao: "Seringa descartável 20ml", quantidadeSolicitada: 3 },
  { id: 6, codigo: "30717012", descricao: "Anestesia local", quantidadeSolicitada: 1 },
];

// mock — itens solicitados que o prestador executor não está habilitado a executar (só informativo)
const ITENS_NAO_HABILITADOS: ItemExecucao[] = [
  { id: 101, codigo: "31309013", descricao: "Ressonância magnética de coluna", quantidadeSolicitada: 1 },
  { id: 102, codigo: "40902040", descricao: "Prótese ortopédica", quantidadeSolicitada: 1 },
];

function gerarNumeroLote() {
  const ano = new Date().getFullYear();
  return `LT-${ano}-${String(Math.floor(1000 + Math.random() * 9000))}`;
}

/**
 * Tela "Executar requisição" (menu Guia TISS > Execução de guias). Bloco de
 * filtro no topo (requisição, beneficiário, prestador executor, token) e,
 * após "Carregar itens", uma tabela de procedimentos/materiais com seleção
 * múltipla e quantidade a executar editável por linha (mock — sem backend).
 */
export default function ExecutarRequisicaoPage() {
  const { theme } = useTheme();

  const [requisicao, setRequisicao] = useState("");
  const [beneficiario, setBeneficiario] = useState("");
  const [prestadorExecutorId, setPrestadorExecutorId] = useState(PRESTADORES[0].id);
  const [possuiToken, setPossuiToken] = useState("Sim");
  const [motivoSemToken, setMotivoSemToken] = useState(MOTIVOS_AUSENCIA_TOKEN[0].codigo);

  const [itensCarregados, setItensCarregados] = useState(false);
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [quantidades, setQuantidades] = useState<Record<number, number>>({});
  const [lote, setLote] = useState<string | null>(null);
  const [localizadorAberto, setLocalizadorAberto] = useState(false);

  const fieldProps = { bg: theme.contentCardBg, textColor: theme.textColor };
  const label = "font-body text-xs font-medium block mb-1.5";
  const labelStyle: React.CSSProperties = { color: theme.textColor };
  const cardStyle = { backgroundColor: theme.contentCardBg, border: `1px solid ${C.borderSoft}` };

  const handleCarregarItens = (e: React.FormEvent) => {
    e.preventDefault();
    setLote(gerarNumeroLote());
    setItensCarregados(true);
    setSelecionados(new Set());
    setQuantidades(Object.fromEntries(ITENS_MOCK.map((item) => [item.id, 0])));
  };

  const handleNovaConsulta = () => {
    setRequisicao("");
    setBeneficiario("");
    setPrestadorExecutorId(PRESTADORES[0].id);
    setPossuiToken("Sim");
    setMotivoSemToken(MOTIVOS_AUSENCIA_TOKEN[0].codigo);
    setItensCarregados(false);
    setSelecionados(new Set());
    setQuantidades({});
    setLote(null);
  };

  const toggleSelecionado = (id: number) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const todosSelecionados = itensCarregados && selecionados.size === ITENS_MOCK.length;
  const toggleTodos = () => {
    setSelecionados(todosSelecionados ? new Set() : new Set(ITENS_MOCK.map((item) => item.id)));
  };

  const columns: Column<ItemExecucao>[] = [
    {
      key: "sel",
      header: (
        <input type="checkbox" checked={todosSelecionados} onChange={toggleTodos} className="rounded" aria-label="Selecionar todos" />
      ),
      render: (item) => (
        <input
          type="checkbox"
          checked={selecionados.has(item.id)}
          onChange={() => toggleSelecionado(item.id)}
          className="rounded"
          aria-label={`Selecionar ${item.descricao}`}
        />
      ),
    },
    { key: "codigo", header: "Código", mono: true },
    { key: "descricao", header: "Descrição" },
    {
      key: "quantidadeSolicitada",
      header: "Qtd. Solicitada",
      render: (item) => <span className="font-mono text-sm" style={{ color: theme.textColor }}>{item.quantidadeSolicitada}</span>,
    },
    {
      key: "quantidadeExecutar",
      header: "Qtd. a Executar",
      render: (item) => (
        <input
          type="number"
          min={0}
          value={quantidades[item.id] ?? 0}
          onChange={(e) => setQuantidades((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
          className="font-mono text-sm w-20 rounded-lg px-2.5 py-1.5 outline-none"
          style={{ backgroundColor: C.bgPanelAlt, border: `1px solid ${C.border}`, color: theme.textColor }}
        />
      ),
    },
  ];

  // lista somente informativa — sem seleção e sem quantidade editável
  const columnsNaoHabilitados: Column<ItemExecucao>[] = [
    { key: "codigo", header: "Código", mono: true },
    { key: "descricao", header: "Descrição" },
    {
      key: "quantidadeSolicitada",
      header: "Qtd. Solicitada",
      render: (item) => <span className="font-mono text-sm" style={{ color: theme.textColor }}>{item.quantidadeSolicitada}</span>,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold" style={{ color: theme.textColor }}>
          Executar requisição
        </h1>
        <p className="font-body text-sm mt-1" style={{ color: theme.textColor }}>
          Informe os dados da requisição para carregar os procedimentos e materiais a executar
        </p>
      </div>

      {/* filtro / dados da requisição */}
      <form onSubmit={handleCarregarItens} className="rounded-xl p-4 sm:p-5 mb-5" style={cardStyle}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className={label} style={labelStyle}>Requisição</label>
            <Input
              mono
              value={requisicao}
              onChange={(e) => setRequisicao(e.target.value)}
              placeholder="Código da requisição (ex: GU-208451)"
              {...fieldProps}
            />
          </div>
          <div>
            <label className={label} style={labelStyle}>Beneficiário</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <Input
                  required
                  value={beneficiario}
                  onChange={(e) => setBeneficiario(e.target.value)}
                  placeholder="Nome do beneficiário"
                  {...fieldProps}
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
          </div>
          <div>
            <label className={label} style={labelStyle}>Prestador executor</label>
            <Select
              value={prestadorExecutorId}
              onChange={(e) => setPrestadorExecutorId(Number(e.target.value))}
              className="w-full"
              {...fieldProps}
            >
              {PRESTADORES.slice(0, 20).map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
            <div className="w-36 shrink-0">
              <label className={label} style={labelStyle}>Possui Token?</label>
              <Select value={possuiToken} onChange={(e) => setPossuiToken(e.target.value)} className="w-full" {...fieldProps}>
                <option>Sim</option>
                <option>Não</option>
              </Select>
            </div>
            <div className="flex-1 min-w-0">
              <label className={label} style={labelStyle}>Motivo da ausência de Token</label>
              <Select
                value={motivoSemToken}
                onChange={(e) => setMotivoSemToken(e.target.value)}
                disabled={possuiToken !== "Não"}
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                {...fieldProps}
              >
                {MOTIVOS_AUSENCIA_TOKEN.map((m) => (
                  <option key={m.codigo} value={m.codigo}>{m.codigo} - {m.descricao}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-4">
          <div>
            {lote && (
              <span className="font-body text-xs" style={{ color: theme.textColor }}>
                Lote gerado: <span className="font-mono text-sm font-bold" style={{ color: C.bronze }}>{lote}</span>
              </span>
            )}
          </div>
          <div className="flex gap-3 shrink-0">
            {itensCarregados && (
              <Button type="button" variant="secondary" icon={RefreshCw} onClick={handleNovaConsulta}>
                Nova consulta
              </Button>
            )}
            <Button type="submit" icon={ListChecks} disabled={itensCarregados}>
              Carregar itens
            </Button>
          </div>
        </div>
      </form>

      {/* itens da requisição */}
      {itensCarregados && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-sm font-bold" style={{ color: theme.textColor }}>
              Procedimentos e materiais
            </h2>
            <span className="font-body text-xs" style={{ color: theme.textColor }}>
              {selecionados.size} de {ITENS_MOCK.length} selecionado(s)
            </span>
          </div>

          <DataTable
            columns={columns}
            data={ITENS_MOCK}
            getRowKey={(item) => item.id}
            renderMobileCard={(item) => (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={selecionados.has(item.id)}
                    onChange={() => toggleSelecionado(item.id)}
                    className="rounded shrink-0"
                    aria-label={`Selecionar ${item.descricao}`}
                  />
                  <div className="min-w-0">
                    <p className="font-mono text-xs" style={{ color: theme.textColor }}>{item.codigo}</p>
                    <p className="font-body text-sm truncate" style={{ color: theme.textColor }}>{item.descricao}</p>
                  </div>
                </div>
                <input
                  type="number"
                  min={0}
                  value={quantidades[item.id] ?? 0}
                  onChange={(e) => setQuantidades((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))}
                  className="font-mono text-sm w-16 rounded-lg px-2 py-1.5 outline-none shrink-0"
                  style={{ backgroundColor: C.bgPanelAlt, border: `1px solid ${C.border}`, color: theme.textColor }}
                />
              </div>
            )}
          />

          <div className="flex justify-end mt-4">
            <Button icon={Check} disabled={selecionados.size === 0}>
              Confirmar execução
            </Button>
          </div>

          {/* serviços solicitados que o prestador não pode executar — só informativo */}
          {ITENS_NAO_HABILITADOS.length > 0 && (
            <div className="mt-6">
              <h2 className="font-display text-sm font-bold mb-3" style={{ color: theme.textColor }}>
                Serviços não habilitado para prestador
              </h2>
              <DataTable
                columns={columnsNaoHabilitados}
                data={ITENS_NAO_HABILITADOS}
                getRowKey={(item) => item.id}
                renderMobileCard={(item) => (
                  <div>
                    <p className="font-mono text-xs" style={{ color: theme.textColor }}>{item.codigo}</p>
                    <p className="font-body text-sm" style={{ color: theme.textColor }}>{item.descricao}</p>
                    <p className="font-mono text-xs mt-1" style={{ color: theme.textColor }}>
                      Qtd. solicitada: {item.quantidadeSolicitada}
                    </p>
                  </div>
                )}
              />
            </div>
          )}
        </>
      )}

      <LocalizadorBeneficiario
        open={localizadorAberto}
        onClose={() => setLocalizadorAberto(false)}
        onSelect={(b) => setBeneficiario(b.carteiraNome)}
      />
    </div>
  );
}
