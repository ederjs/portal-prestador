import React, { useRef, useState } from "react";
import {
  UploadCloud,
  FileCode2,
  Download,
  ArrowLeft,
  Search,
  Layers,
  Receipt,
  ListChecks,
  CheckCircle2,
  Loader2,
  ChevronRight,
  PackageCheck,
} from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import { PRESTADORES } from "../data/mock";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import DataTable, { type Column } from "../components/ui/DataTable";

/* ------------------------------------------------------------------ */
/*  DOMÍNIO LOCAL — simulação de envio de lote de guias TISS em XML.   */
/*  Sem backend: o "arquivo" é gerado e "importado" inteiramente no    */
/*  cliente, só para demonstrar o fluxo protocolo → contas → itens.    */
/* ------------------------------------------------------------------ */
interface ItemContaLote {
  id: number;
  tabela: string;
  codigo: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

interface ContaLote {
  id: number;
  numeroConta: string;
  numeroGuia: string;
  carteira: string;
  beneficiario: string;
  dataAtendimento: string;
  prestadorNome: string;
  tipoGuia: string;
  itens: ItemContaLote[];
  valorTotal: number;
}

type StatusProtocolo = "Processado" | "Pendente" | "Com glosa";

interface ProtocoloLote {
  id: number;
  numeroProtocolo: string;
  nomeArquivo: string;
  dataEnvio: string;
  qtdContas: number;
  valorTotal: number;
  status: StatusProtocolo;
  contas: ContaLote[];
}

type Passo = "upload" | "protocolos" | "contas" | "itens";

const NOMES_BENEFICIARIOS_LOTE = [
  "Fernanda Lopes", "Ricardo Nunes", "Bianca Ferreira", "Caio Teixeira",
  "Débora Azevedo", "Gustavo Ramos", "Helena Campos", "Igor Barros",
  "Juliana Dias", "Marcelo Pinto", "Natália Rezende", "Otávio Correia",
  "Patrícia Moura", "Rodrigo Vieira", "Simone Araújo", "Tiago Monteiro",
];

const PROCEDIMENTOS_POOL = [
  { tabela: "22", codigo: "10101012", descricao: "Consulta em consultório", valor: 80 },
  { tabela: "22", codigo: "40304361", descricao: "Hemograma completo", valor: 18.5 },
  { tabela: "22", codigo: "40311210", descricao: "Glicose", valor: 9.2 },
  { tabela: "22", codigo: "41001013", descricao: "Eletrocardiograma", valor: 45 },
  { tabela: "22", codigo: "31602018", descricao: "Ultrassonografia abdominal total", valor: 120 },
  { tabela: "22", codigo: "40901019", descricao: "Raio-X de tórax (2 incidências)", valor: 60 },
  { tabela: "22", codigo: "10104014", descricao: "Consulta em pronto socorro", valor: 95 },
  { tabela: "22", codigo: "20103012", descricao: "Curativo simples", valor: 25 },
  { tabela: "22", codigo: "40302016", descricao: "Colesterol total", valor: 14 },
  { tabela: "22", codigo: "31309035", descricao: "Tomografia computadorizada de crânio", valor: 350 },
  { tabela: "22", codigo: "10121012", descricao: "Consulta em pronto atendimento", valor: 70 },
  { tabela: "22", codigo: "40316018", descricao: "Urina tipo I (EAS)", valor: 12 },
];

function aleatorio<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function gerarCarteira13(): string {
  let s = "";
  for (let i = 0; i < 13; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function dataAleatoriaRecente(): string {
  const hoje = new Date();
  const dias = Math.floor(Math.random() * 45);
  const d = new Date(hoje.getTime() - dias * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

let proximoContaId = 1;
let proximoItemId = 1;
let proximoProtocoloId = 1;

function gerarItensConta(): ItemContaLote[] {
  const qtd = 1 + Math.floor(Math.random() * 4);
  const itens: ItemContaLote[] = [];
  for (let i = 0; i < qtd; i++) {
    const p = aleatorio(PROCEDIMENTOS_POOL);
    const quantidade = 1 + Math.floor(Math.random() * 2);
    itens.push({
      id: proximoItemId++,
      tabela: p.tabela,
      codigo: p.codigo,
      descricao: p.descricao,
      quantidade,
      valorUnitario: p.valor,
    });
  }
  return itens;
}

function gerarConta(sequencia: number): ContaLote {
  const itens = gerarItensConta();
  const valorTotal = itens.reduce((acc, it) => acc + it.quantidade * it.valorUnitario, 0);
  return {
    id: proximoContaId++,
    numeroConta: String(sequencia).padStart(6, "0"),
    numeroGuia: String(Math.floor(1_000_000_000 + Math.random() * 8_999_999_999)),
    carteira: gerarCarteira13(),
    beneficiario: aleatorio(NOMES_BENEFICIARIOS_LOTE),
    dataAtendimento: dataAleatoriaRecente(),
    prestadorNome: aleatorio(PRESTADORES).nome,
    tipoGuia: "SP/SADT",
    itens,
    valorTotal,
  };
}

function gerarContas(qtd: number): ContaLote[] {
  const contas: ContaLote[] = [];
  for (let i = 1; i <= qtd; i++) contas.push(gerarConta(i));
  return contas;
}

/** Monta um XML no formato (simplificado, só para demonstração) do padrão
 *  TISS de envio de lote de guias — ans:mensagemTISS > loteGuias > guiaSP-SADT,
 *  uma guia por conta médica, cada uma com seus procedimentos executados. */
function gerarXmlLote(contas: ContaLote[], numeroLote: string): string {
  const agora = new Date();
  const dataRegistro = agora.toISOString().slice(0, 10);
  const horaRegistro = agora.toTimeString().slice(0, 8);

  const guias = contas
    .map((conta) => {
      const procedimentos = conta.itens
        .map(
          (it) => `        <ans:procedimentoExecutado>
          <ans:procedimento>
            <ans:codigoTabela>${it.tabela}</ans:codigoTabela>
            <ans:codigoProcedimento>${it.codigo}</ans:codigoProcedimento>
            <ans:descricaoProcedimento>${it.descricao}</ans:descricaoProcedimento>
          </ans:procedimento>
          <ans:quantidadeExecutada>${it.quantidade}</ans:quantidadeExecutada>
          <ans:valorUnitario>${it.valorUnitario.toFixed(2)}</ans:valorUnitario>
          <ans:valorTotal>${(it.quantidade * it.valorUnitario).toFixed(2)}</ans:valorTotal>
        </ans:procedimentoExecutado>`
        )
        .join("\n");

      return `      <ans:guiaSP-SADT>
        <ans:cabecalhoGuia>
          <ans:registroANS>123456</ans:registroANS>
          <ans:numeroGuiaPrestador>${conta.numeroGuia}</ans:numeroGuiaPrestador>
        </ans:cabecalhoGuia>
        <ans:numeroContaMedica>${conta.numeroConta}</ans:numeroContaMedica>
        <ans:dadosBeneficiario>
          <ans:numeroCarteira>${conta.carteira}</ans:numeroCarteira>
          <ans:nomeBeneficiario>${conta.beneficiario}</ans:nomeBeneficiario>
        </ans:dadosBeneficiario>
        <ans:dadosExecutante>
          <ans:nomeContratado>${conta.prestadorNome}</ans:nomeContratado>
        </ans:dadosExecutante>
        <ans:dadosAtendimento>
          <ans:dataAtendimento>${conta.dataAtendimento}</ans:dataAtendimento>
          <ans:tipoGuia>${conta.tipoGuia}</ans:tipoGuia>
        </ans:dadosAtendimento>
        <ans:procedimentosExecutados>
${procedimentos}
        </ans:procedimentosExecutados>
        <ans:valorTotalGuia>${conta.valorTotal.toFixed(2)}</ans:valorTotalGuia>
      </ans:guiaSP-SADT>`;
    })
    .join("\n");

  const valorTotalLote = contas.reduce((acc, c) => acc + c.valorTotal, 0);

  return `<?xml version="1.0" encoding="ISO-8859-1"?>
<ans:mensagemTISS xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ans:cabecalho>
    <ans:identificacaoTransacao>
      <ans:tipoTransacao>ENVIO_LOTE_GUIAS</ans:tipoTransacao>
      <ans:sequencialTransacao>${numeroLote}</ans:sequencialTransacao>
      <ans:dataRegistroTransacao>${dataRegistro}</ans:dataRegistroTransacao>
      <ans:horaRegistroTransacao>${horaRegistro}</ans:horaRegistroTransacao>
    </ans:identificacaoTransacao>
    <ans:origem>
      <ans:identificacaoPrestador>
        <ans:codigoPrestadorNaOperadora>000123</ans:codigoPrestadorNaOperadora>
      </ans:identificacaoPrestador>
    </ans:origem>
    <ans:destino>
      <ans:registroANS>123456</ans:registroANS>
    </ans:destino>
    <ans:Padrao>3.05.00</ans:Padrao>
  </ans:cabecalho>
  <ans:prestadorParaOperadora>
    <ans:loteGuias>
      <ans:numeroLote>${numeroLote}</ans:numeroLote>
      <ans:quantidadeGuias>${contas.length}</ans:quantidadeGuias>
      <ans:valorTotalLote>${valorTotalLote.toFixed(2)}</ans:valorTotalLote>
      <ans:guiasTISS>
${guias}
      </ans:guiasTISS>
    </ans:loteGuias>
  </ans:prestadorParaOperadora>
</ans:mensagemTISS>
`;
}

function formatarMoeda(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarDataBr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function badgeStatus(status: StatusProtocolo, textColor: string) {
  const cfg: Record<StatusProtocolo, { color: string; bg: string }> = {
    Processado: { color: C.teal, bg: C.tealSoft },
    Pendente: { color: C.amber, bg: C.amberSoft },
    "Com glosa": { color: C.coral, bg: C.coralSoft },
  };
  const s = cfg[status];
  return (
    <span
      className="font-body inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {status}
    </span>
  );
}

// protocolos de exemplo, já "enviados" anteriormente — para a lista não começar vazia
function protocolosSeed(): ProtocoloLote[] {
  const contas1 = gerarContas(12);
  const contas2 = gerarContas(7);
  return [
    {
      id: proximoProtocoloId++,
      numeroProtocolo: "20261001000045",
      nomeArquivo: "lote_spsadt_outubro_01.xml",
      dataEnvio: "2026-10-01",
      qtdContas: contas1.length,
      valorTotal: contas1.reduce((acc, c) => acc + c.valorTotal, 0),
      status: "Processado",
      contas: contas1,
    },
    {
      id: proximoProtocoloId++,
      numeroProtocolo: "20261008000112",
      nomeArquivo: "lote_spsadt_outubro_08.xml",
      dataEnvio: "2026-10-08",
      qtdContas: contas2.length,
      valorTotal: contas2.reduce((acc, c) => acc + c.valorTotal, 0),
      status: "Com glosa",
      contas: contas2,
    },
  ];
}

const PAGE_SIZE = 20;

/**
 * Página "Enviar lote" (menu Produção médica) — simula o envio de um lote
 * de guias TISS em XML (cobrança de contas de SP/SADT): gera um arquivo de
 * exemplo com ~10 contas e procedimentos, simula a importação, e mostra o
 * protocolo gerado com navegação protocolo → contas → itens (um arquivo real
 * pode ter até 100 contas, então a listagem de contas tem busca + paginação).
 */
export default function EnviarLotePage() {
  const { theme } = useTheme();
  const [passo, setPasso] = useState<Passo>("upload");
  const [protocolos, setProtocolos] = useState<ProtocoloLote[]>(() => protocolosSeed());
  const [protocoloSelecionadoId, setProtocoloSelecionadoId] = useState<number | null>(null);
  const [contaSelecionadaId, setContaSelecionadaId] = useState<number | null>(null);

  const [xmlGerado, setXmlGerado] = useState<{ nomeArquivo: string; conteudo: string; qtdContas: number; tamanhoKb: number } | null>(null);
  const [importando, setImportando] = useState(false);
  const contasGeradasRef = useRef<ContaLote[] | null>(null);

  const [buscaConta, setBuscaConta] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const protocoloSelecionado = protocolos.find((p) => p.id === protocoloSelecionadoId) ?? null;
  const contaSelecionada = protocoloSelecionado?.contas.find((c) => c.id === contaSelecionadaId) ?? null;

  const handleGerarXml = () => {
    const contas = gerarContas(10);
    contasGeradasRef.current = contas;
    const numeroLote = String(Math.floor(100000 + Math.random() * 899999));
    const xml = gerarXmlLote(contas, numeroLote);
    setXmlGerado({
      nomeArquivo: `lote_spsadt_exemplo_${numeroLote}.xml`,
      conteudo: xml,
      qtdContas: contas.length,
      tamanhoKb: Math.max(1, Math.round(new Blob([xml]).size / 1024)),
    });
  };

  const handleBaixarXml = () => {
    if (!xmlGerado) return;
    const blob = new Blob([xmlGerado.conteudo], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = xmlGerado.nomeArquivo;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportar = () => {
    if (!xmlGerado || !contasGeradasRef.current) return;
    setImportando(true);
    // simula o processamento do lote — sem backend real
    setTimeout(() => {
      const contas = contasGeradasRef.current!;
      const novoProtocolo: ProtocoloLote = {
        id: proximoProtocoloId++,
        numeroProtocolo: `${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${String(Math.floor(1000 + Math.random() * 8999))}`,
        nomeArquivo: xmlGerado.nomeArquivo,
        dataEnvio: new Date().toISOString().slice(0, 10),
        qtdContas: contas.length,
        valorTotal: contas.reduce((acc, c) => acc + c.valorTotal, 0),
        status: "Pendente",
        contas,
      };
      setProtocolos((prev) => [novoProtocolo, ...prev]);
      setImportando(false);
      setXmlGerado(null);
      contasGeradasRef.current = null;
      setProtocoloSelecionadoId(novoProtocolo.id);
      setPasso("contas");
    }, 900);
  };

  const abrirProtocolo = (p: ProtocoloLote) => {
    setProtocoloSelecionadoId(p.id);
    setBuscaConta("");
    setVisibleCount(PAGE_SIZE);
    setPasso("contas");
  };

  const abrirConta = (c: ContaLote) => {
    setContaSelecionadaId(c.id);
    setPasso("itens");
  };

  const contasFiltradas = (protocoloSelecionado?.contas ?? []).filter((c) => {
    const q = buscaConta.trim().toLowerCase();
    if (!q) return true;
    return (
      c.numeroConta.toLowerCase().includes(q) ||
      c.beneficiario.toLowerCase().includes(q) ||
      c.carteira.includes(q) ||
      c.numeroGuia.includes(q)
    );
  });
  const contasVisiveis = contasFiltradas.slice(0, visibleCount);
  const temMaisContas = visibleCount < contasFiltradas.length;

  const colunasProtocolos: Column<ProtocoloLote>[] = [
    {
      key: "numeroProtocolo",
      header: "Protocolo",
      render: (p) => (
        <>
          <p className="font-mono text-sm" style={{ color: theme.textColor }}>{p.numeroProtocolo}</p>
          <p className="font-body text-xs mt-0.5 opacity-80" style={{ color: theme.textColor }}>{p.nomeArquivo}</p>
        </>
      ),
    },
    { key: "dataEnvio", header: "Data de envio", render: (p) => <span style={{ color: theme.textColor }}>{formatarDataBr(p.dataEnvio)}</span> },
    { key: "qtdContas", header: "Qtd. contas", mono: true },
    { key: "valorTotal", header: "Valor total", render: (p) => <span className="font-mono text-sm" style={{ color: theme.textColor }}>{formatarMoeda(p.valorTotal)}</span> },
    { key: "status", header: "Status", render: (p) => badgeStatus(p.status, theme.textColor) },
    {
      key: "acoes",
      header: "",
      render: (p) => (
        <Button type="button" variant="secondary" size="sm" icon={ChevronRight} iconPosition="right" onClick={() => abrirProtocolo(p)}>
          Ver contas
        </Button>
      ),
    },
  ];

  const colunasContas: Column<ContaLote>[] = [
    {
      key: "numeroConta",
      header: "Conta",
      render: (c) => (
        <>
          <p className="font-mono text-sm" style={{ color: theme.textColor }}>{c.numeroConta}</p>
          <p className="font-body text-xs mt-0.5 opacity-80" style={{ color: theme.textColor }}>Guia {c.numeroGuia}</p>
        </>
      ),
    },
    {
      key: "beneficiario",
      header: "Beneficiário",
      render: (c) => (
        <>
          <p className="font-body text-sm" style={{ color: theme.textColor }}>{c.beneficiario}</p>
          <p className="font-mono text-xs mt-0.5 opacity-80" style={{ color: theme.textColor }}>{c.carteira}</p>
        </>
      ),
    },
    { key: "dataAtendimento", header: "Atendimento", render: (c) => <span style={{ color: theme.textColor }}>{formatarDataBr(c.dataAtendimento)}</span> },
    { key: "prestadorNome", header: "Prestador executante", render: (c) => <span style={{ color: theme.textColor }}>{c.prestadorNome}</span> },
    { key: "valorTotal", header: "Valor da conta", render: (c) => <span className="font-mono text-sm" style={{ color: theme.textColor }}>{formatarMoeda(c.valorTotal)}</span> },
    {
      key: "acoes",
      header: "",
      render: (c) => (
        <Button type="button" variant="secondary" size="sm" icon={ChevronRight} iconPosition="right" onClick={() => abrirConta(c)}>
          Ver itens
        </Button>
      ),
    },
  ];

  const colunasItens: Column<ItemContaLote>[] = [
    { key: "tabela", header: "Tabela", mono: true },
    { key: "codigo", header: "Código TUSS", mono: true },
    { key: "descricao", header: "Descrição" },
    { key: "quantidade", header: "Qtd.", mono: true },
    { key: "valorUnitario", header: "Valor unit.", render: (i) => <span className="font-mono text-sm" style={{ color: theme.textColor }}>{formatarMoeda(i.valorUnitario)}</span> },
    { key: "valorTotal", header: "Valor total", render: (i) => <span className="font-mono text-sm" style={{ color: theme.textColor }}>{formatarMoeda(i.quantidade * i.valorUnitario)}</span> },
  ];

  const sectionCard = "rounded-xl p-4 sm:p-5";
  const sectionCardStyle = { backgroundColor: theme.contentCardBg, border: `1px solid ${C.borderSoft}` };
  const sectionTitle = "font-body text-xs font-semibold uppercase tracking-wide mb-4";

  return (
    <div>
      {/* cabeçalho da página + navegação entre passos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-xl font-bold" style={{ color: theme.textColor }}>Enviar lote</h1>
          <p className="font-body text-sm mt-1" style={{ color: theme.textColor }}>
            Envio de lote de guias TISS (cobrança de contas de SP/SADT) em arquivo XML
          </p>
        </div>
        <div className="flex items-center gap-2">
          {passo !== "upload" && (
            <Button type="button" variant="secondary" icon={UploadCloud} onClick={() => setPasso("upload")}>
              Novo envio
            </Button>
          )}
          {passo !== "protocolos" && (
            <Button type="button" variant="secondary" icon={Layers} onClick={() => setPasso("protocolos")}>
              Protocolos enviados
            </Button>
          )}
        </div>
      </div>

      {/* trilha / breadcrumb do drill-down quando dentro de um protocolo */}
      {(passo === "contas" || passo === "itens") && protocoloSelecionado && (
        <div className="flex items-center flex-wrap gap-1.5 mb-4 font-body text-xs" style={{ color: theme.textColor }}>
          <button type="button" className="opacity-80 hover:opacity-100 underline-offset-2 hover:underline" onClick={() => setPasso("protocolos")}>
            Protocolos
          </button>
          <ChevronRight size={12} />
          <button
            type="button"
            className={passo === "itens" ? "opacity-80 hover:opacity-100 underline-offset-2 hover:underline" : "font-semibold"}
            onClick={() => setPasso("contas")}
          >
            Protocolo {protocoloSelecionado.numeroProtocolo}
          </button>
          {passo === "itens" && contaSelecionada && (
            <>
              <ChevronRight size={12} />
              <span className="font-semibold">Conta {contaSelecionada.numeroConta}</span>
            </>
          )}
        </div>
      )}

      {/* PASSO 1 — upload / geração do XML de exemplo + simulação de importação */}
      {passo === "upload" && (
        <div className="space-y-4">
          <div className={sectionCard} style={sectionCardStyle}>
            <p className={sectionTitle} style={{ color: theme.textColor }}>Arquivo do lote (padrão TISS)</p>
            <p className="font-body text-sm mb-4 opacity-90" style={{ color: theme.textColor }}>
              Gere um arquivo XML de exemplo seguindo a estrutura padrão TISS de envio de lote de guias
              (<span className="font-mono text-xs">ans:mensagemTISS &gt; loteGuias &gt; guiaSP-SADT</span>), com 10 contas médicas
              e procedimentos de exemplo, e simule a importação para gerar o protocolo de transmissão.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" icon={FileCode2} onClick={handleGerarXml}>
                Gerar XML de exemplo (10 contas)
              </Button>
              {xmlGerado && (
                <Button type="button" variant="secondary" icon={Download} onClick={handleBaixarXml}>
                  Baixar {xmlGerado.nomeArquivo}
                </Button>
              )}
            </div>

            {xmlGerado && (
              <div className="mt-5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ backgroundColor: C.bgPanelAlt, border: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: theme.headerControlBg }}>
                    <FileCode2 size={18} style={{ color: C.bronze }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-sm truncate" style={{ color: theme.textColor }}>{xmlGerado.nomeArquivo}</p>
                    <p className="font-body text-xs mt-0.5 opacity-80" style={{ color: theme.textColor }}>
                      {xmlGerado.qtdContas} contas · ~{xmlGerado.tamanhoKb} KB · pronto para importar
                    </p>
                  </div>
                </div>
                <Button type="button" icon={importando ? Loader2 : UploadCloud} onClick={handleImportar} disabled={importando}>
                  {importando ? "Importando..." : "Simular importação"}
                </Button>
              </div>
            )}
          </div>

          <div className={sectionCard} style={sectionCardStyle}>
            <p className={sectionTitle} style={{ color: theme.textColor }}>Como funciona</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-start gap-2.5">
                <FileCode2 size={16} className="mt-0.5 shrink-0" style={{ color: theme.textColor }} />
                <p className="font-body text-xs" style={{ color: theme.textColor }}>Gere ou envie um arquivo XML de lote de guias no padrão TISS.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <PackageCheck size={16} className="mt-0.5 shrink-0" style={{ color: theme.textColor }} />
                <p className="font-body text-xs" style={{ color: theme.textColor }}>A importação gera um protocolo de transmissão com todas as contas do lote.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <ListChecks size={16} className="mt-0.5 shrink-0" style={{ color: theme.textColor }} />
                <p className="font-body text-xs" style={{ color: theme.textColor }}>Acesse o protocolo para ver cada conta e os itens (procedimentos) cobrados.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PASSO 2 — lista de protocolos (lotes) já enviados */}
      {passo === "protocolos" && (
        <DataTable
          columns={colunasProtocolos}
          data={protocolos}
          emptyMessage="Nenhum lote enviado ainda."
          renderMobileCard={(p) => (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-sm truncate" style={{ color: theme.textColor }}>{p.numeroProtocolo}</p>
                  <p className="font-body text-xs mt-0.5 opacity-80" style={{ color: theme.textColor }}>{formatarDataBr(p.dataEnvio)} · {p.qtdContas} contas</p>
                </div>
                {badgeStatus(p.status, theme.textColor)}
              </div>
              <Button type="button" variant="secondary" size="sm" fullWidth icon={ChevronRight} iconPosition="right" onClick={() => abrirProtocolo(p)}>
                Ver contas
              </Button>
            </div>
          )}
        />
      )}

      {/* PASSO 3 — contas do protocolo selecionado (com busca, já que pode haver até 100) */}
      {passo === "contas" && protocoloSelecionado && (
        <div className="space-y-4">
          <div className={sectionCard} style={sectionCardStyle}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: theme.headerControlBg }}>
                  <Receipt size={18} style={{ color: C.bronze }} />
                </div>
                <div>
                  <p className="font-mono text-sm" style={{ color: theme.textColor }}>Protocolo {protocoloSelecionado.numeroProtocolo}</p>
                  <p className="font-body text-xs mt-0.5 opacity-80" style={{ color: theme.textColor }}>
                    {protocoloSelecionado.qtdContas} contas · {formatarMoeda(protocoloSelecionado.valorTotal)} · enviado em {formatarDataBr(protocoloSelecionado.dataEnvio)}
                  </p>
                </div>
              </div>
              {badgeStatus(protocoloSelecionado.status, theme.textColor)}
            </div>
          </div>

          <Input
            icon={Search}
            value={buscaConta}
            onChange={(e) => { setBuscaConta(e.target.value); setVisibleCount(PAGE_SIZE); }}
            placeholder="Buscar conta por nº da conta, guia, carteira ou beneficiário"
            bg={theme.contentCardBg}
            textColor={theme.textColor}
          />

          <DataTable
            columns={colunasContas}
            data={contasVisiveis}
            emptyMessage="Nenhuma conta encontrada para a busca."
            renderMobileCard={(c) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-body text-sm truncate" style={{ color: theme.textColor }}>{c.beneficiario}</p>
                    <p className="font-mono text-xs mt-0.5 opacity-80" style={{ color: theme.textColor }}>{c.numeroConta}</p>
                  </div>
                  <span className="font-mono text-xs" style={{ color: theme.textColor }}>{formatarMoeda(c.valorTotal)}</span>
                </div>
                <Button type="button" variant="secondary" size="sm" fullWidth icon={ChevronRight} iconPosition="right" onClick={() => abrirConta(c)}>
                  Ver itens
                </Button>
              </div>
            )}
          />

          {temMaisContas && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}>
                Carregar mais contas
              </Button>
            </div>
          )}
        </div>
      )}

      {/* PASSO 4 — itens (procedimentos) da conta selecionada */}
      {passo === "itens" && contaSelecionada && (
        <div className="space-y-4">
          <div className={sectionCard} style={sectionCardStyle}>
            <div className="flex items-center gap-2 mb-4">
              <Button type="button" variant="ghost" size="sm" icon={ArrowLeft} onClick={() => setPasso("contas")}>
                Voltar às contas
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <p className="font-body text-xs opacity-80" style={{ color: theme.textColor }}>Conta / Guia</p>
                <p className="font-mono text-sm" style={{ color: theme.textColor }}>{contaSelecionada.numeroConta} · {contaSelecionada.numeroGuia}</p>
              </div>
              <div>
                <p className="font-body text-xs opacity-80" style={{ color: theme.textColor }}>Beneficiário</p>
                <p className="font-body text-sm" style={{ color: theme.textColor }}>{contaSelecionada.beneficiario}</p>
                <p className="font-mono text-xs opacity-80" style={{ color: theme.textColor }}>{contaSelecionada.carteira}</p>
              </div>
              <div>
                <p className="font-body text-xs opacity-80" style={{ color: theme.textColor }}>Prestador executante</p>
                <p className="font-body text-sm" style={{ color: theme.textColor }}>{contaSelecionada.prestadorNome}</p>
              </div>
              <div>
                <p className="font-body text-xs opacity-80" style={{ color: theme.textColor }}>Atendimento / Guia</p>
                <p className="font-body text-sm" style={{ color: theme.textColor }}>{formatarDataBr(contaSelecionada.dataAtendimento)} · {contaSelecionada.tipoGuia}</p>
              </div>
            </div>
          </div>

          <DataTable
            columns={colunasItens}
            data={contaSelecionada.itens}
            emptyMessage="Esta conta não possui itens."
            renderMobileCard={(i) => (
              <div className="space-y-1">
                <p className="font-body text-sm" style={{ color: theme.textColor }}>{i.descricao}</p>
                <p className="font-mono text-xs opacity-80" style={{ color: theme.textColor }}>Tab. {i.tabela} · {i.codigo}</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs" style={{ color: theme.textColor }}>Qtd {i.quantidade} × {formatarMoeda(i.valorUnitario)}</span>
                  <span className="font-mono text-xs font-semibold" style={{ color: theme.textColor }}>{formatarMoeda(i.quantidade * i.valorUnitario)}</span>
                </div>
              </div>
            )}
          />

          <div className="flex justify-end">
            <div className="rounded-xl px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: C.tealSoft }}>
              <CheckCircle2 size={14} style={{ color: C.teal }} />
              <span className="font-body text-xs font-medium" style={{ color: C.teal }}>
                Total da conta: {formatarMoeda(contaSelecionada.valorTotal)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
