import React, { useRef, useState } from "react";
import { Send, Plus, Trash2 } from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import { PRESTADORES } from "../data/mock";
import RequisicaoGuiaFormShell from "../components/RequisicaoGuiaFormShell";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import DataTable, { type Column } from "../components/ui/DataTable";

interface RequisicaoGuiaProrrogacaoIntPageProps {
  onCancel: () => void;
}

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];
const CONSELHOS = ["CRM", "CRO", "COREN", "CREFITO", "CRP", "CRF", "CRN", "CRBM"];
const TIPO_ACOMODACAO = ["Enfermaria", "Apartamento", "UTI", "UTI Neonatal"];
const TABELAS = ["22 - Procedimentos e Eventos em Saúde (TUSS)", "19 - Diárias e Taxas", "20 - Materiais", "21 - Medicamentos"];

interface ProcedimentoItem {
  id: number;
  tabela: string;
  codigo: string;
  descricao: string;
  quantidade: number;
}

interface FormState {
  registroAns: string;
  numeroGuiaPrestador: string;
  numeroGuiaOperadora: string;
  numeroGuiaInternacao: string;
  numeroCarteira: string;
  nome: string;
  codigoOperadora: string;
  contratadoId: number;
  profissionalSolicitante: string;
  conselhoProfissional: string;
  numeroConselho: string;
  uf: string;
  dataSolicitacao: string;
  qtdDiariasUtilizadas: string;
  qtdDiariasAdicionaisSolicitadas: string;
  tipoAcomodacaoSolicitada: string;
  indicacaoClinica: string;
  procedimentos: ProcedimentoItem[];
  observacao: string;
}

function gerarNumeroGuiaPrestador() {
  return String(Math.floor(1_000_000_000 + Math.random() * 8_999_999_999));
}

const FORM_INICIAL: FormState = {
  registroAns: "",
  numeroGuiaPrestador: "",
  numeroGuiaOperadora: "",
  numeroGuiaInternacao: "",
  numeroCarteira: "",
  nome: "",
  codigoOperadora: "",
  contratadoId: PRESTADORES[0].id,
  profissionalSolicitante: "",
  conselhoProfissional: CONSELHOS[0],
  numeroConselho: "",
  uf: "SC",
  dataSolicitacao: "",
  qtdDiariasUtilizadas: "",
  qtdDiariasAdicionaisSolicitadas: "",
  tipoAcomodacaoSolicitada: TIPO_ACOMODACAO[0],
  indicacaoClinica: "",
  procedimentos: [],
  observacao: "",
};

/**
 * Formulário da Guia TISS de Solicitação de Prorrogação de Internação —
 * sempre referenciada a uma Guia de Internação original (campo obrigatório
 * "Nº Guia de Internação"). Segue as seções do layout padrão ANS/TISS:
 * identificação, beneficiário, solicitante, dados da prorrogação (diárias
 * já utilizadas, diárias adicionais solicitadas, acomodação) e os
 * procedimentos/diárias solicitados.
 */
export default function RequisicaoGuiaProrrogacaoIntPage({ onCancel }: RequisicaoGuiaProrrogacaoIntPageProps) {
  const { theme } = useTheme();
  const [form, setForm] = useState<FormState>(() => ({
    ...FORM_INICIAL,
    numeroGuiaPrestador: gerarNumeroGuiaPrestador(),
  }));
  const proximoItemId = useRef(1);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const addProcedimento = () => {
    setForm((f) => ({
      ...f,
      procedimentos: [...f.procedimentos, { id: proximoItemId.current++, tabela: TABELAS[0], codigo: "", descricao: "", quantidade: 1 }],
    }));
  };
  const removeProcedimento = (id: number) => {
    setForm((f) => ({ ...f, procedimentos: f.procedimentos.filter((p) => p.id !== id) }));
  };
  const updateProcedimento = (id: number, campo: keyof ProcedimentoItem, valor: string | number) => {
    setForm((f) => ({ ...f, procedimentos: f.procedimentos.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // mock — sem backend ainda; ao integrar, enviar `form` para POST /guias/prorrogacao
    onCancel();
  };

  const fieldProps = { bg: theme.contentCardBg, textColor: theme.textColor };
  const label = "font-body text-xs font-medium block mb-1.5";
  const labelStyle: React.CSSProperties = { color: theme.textColor };
  const sectionTitle = "font-body text-xs font-semibold uppercase tracking-wide mb-4";
  const sectionCard = "rounded-xl p-4 sm:p-5";
  const sectionCardStyle = { backgroundColor: theme.contentCardBg, border: `1px solid ${C.borderSoft}` };

  const colunasProcedimentos: Column<ProcedimentoItem>[] = [
    {
      key: "tabela",
      header: "Tabela",
      render: (p) => (
        <Select value={p.tabela} onChange={(e) => updateProcedimento(p.id, "tabela", e.target.value)} className="w-full" {...fieldProps}>
          {TABELAS.map((t) => <option key={t}>{t}</option>)}
        </Select>
      ),
    },
    {
      key: "codigo",
      header: "Código",
      render: (p) => (
        <Input mono value={p.codigo} onChange={(e) => updateProcedimento(p.id, "codigo", e.target.value)} placeholder="Código TUSS" {...fieldProps} />
      ),
    },
    {
      key: "descricao",
      header: "Descrição",
      render: (p) => (
        <Input value={p.descricao} onChange={(e) => updateProcedimento(p.id, "descricao", e.target.value)} placeholder="Descrição do procedimento/diária" {...fieldProps} />
      ),
    },
    {
      key: "quantidade",
      header: "Qtd. Solicitada",
      render: (p) => (
        <input
          type="number"
          min={1}
          value={p.quantidade}
          onChange={(e) => updateProcedimento(p.id, "quantidade", Number(e.target.value))}
          className="font-mono text-sm w-20 rounded-lg px-2.5 py-1.5 outline-none"
          style={{ backgroundColor: C.bgPanelAlt, border: `1px solid ${C.border}`, color: theme.textColor }}
        />
      ),
    },
    {
      key: "remover",
      header: "",
      render: (p) => (
        <button
          type="button"
          onClick={() => removeProcedimento(p.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: theme.headerControlBg }}
          aria-label="Remover procedimento"
        >
          <Trash2 size={14} style={{ color: C.coral }} />
        </button>
      ),
    },
  ];

  return (
    <RequisicaoGuiaFormShell title="Guia Prorrogação Internação" onCancel={onCancel}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* identificação da guia */}
        <div className={sectionCard} style={sectionCardStyle}>
          <p className={sectionTitle} style={{ color: theme.textColor }}>Identificação da guia</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className={label} style={labelStyle}>Registro ANS</label>
              <Input mono value={form.registroAns} onChange={set("registroAns")} placeholder="000000" {...fieldProps} />
            </div>
            <div>
              <label className={label} style={labelStyle}>Nº Guia no Prestador</label>
              <Input mono value={form.numeroGuiaPrestador} onChange={set("numeroGuiaPrestador")} {...fieldProps} />
            </div>
            <div>
              <label className={label} style={labelStyle}>Número da Guia Atribuído pela Operadora</label>
              <Input mono value={form.numeroGuiaOperadora} onChange={set("numeroGuiaOperadora")} placeholder="Preenchido pela operadora" {...fieldProps} />
            </div>
            <div>
              <label className={label} style={labelStyle}>Nº Guia de Internação</label>
              <Input required mono value={form.numeroGuiaInternacao} onChange={set("numeroGuiaInternacao")} placeholder="Guia de internação original" {...fieldProps} />
            </div>
          </div>
        </div>

        {/* dados do beneficiário */}
        <div className={sectionCard} style={sectionCardStyle}>
          <p className={sectionTitle} style={{ color: theme.textColor }}>Dados do beneficiário</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={label} style={labelStyle}>Número da Carteira</label>
              <Input mono required value={form.numeroCarteira} onChange={set("numeroCarteira")} placeholder="000.0000.00" {...fieldProps} />
            </div>
            <div className="sm:col-span-2">
              <label className={label} style={labelStyle}>Nome</label>
              <Input required value={form.nome} onChange={set("nome")} placeholder="Nome completo do beneficiário" {...fieldProps} />
            </div>
          </div>
        </div>

        {/* dados do contratado solicitante */}
        <div className={sectionCard} style={sectionCardStyle}>
          <p className={sectionTitle} style={{ color: theme.textColor }}>Dados do contratado solicitante</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className={label} style={labelStyle}>Código na Operadora</label>
              <Input mono value={form.codigoOperadora} onChange={set("codigoOperadora")} placeholder="Código do prestador" {...fieldProps} />
            </div>
            <div className="sm:col-span-2">
              <label className={label} style={labelStyle}>Nome do Contratado</label>
              <Select value={form.contratadoId} onChange={set("contratadoId")} className="w-full" {...fieldProps}>
                {PRESTADORES.slice(0, 20).map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <label className={label} style={labelStyle}>Nome do Profissional Solicitante</label>
              <Input required value={form.profissionalSolicitante} onChange={set("profissionalSolicitante")} placeholder="Nome do profissional" {...fieldProps} />
            </div>
            <div>
              <label className={label} style={labelStyle}>Conselho Profissional</label>
              <Select value={form.conselhoProfissional} onChange={set("conselhoProfissional")} className="w-full" {...fieldProps}>
                {CONSELHOS.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <label className={label} style={labelStyle}>Número no Conselho</label>
              <Input mono value={form.numeroConselho} onChange={set("numeroConselho")} placeholder="000000" {...fieldProps} />
            </div>
            <div>
              <label className={label} style={labelStyle}>UF</label>
              <Select value={form.uf} onChange={set("uf")} className="w-full" {...fieldProps}>
                {UFS.map((uf) => <option key={uf}>{uf}</option>)}
              </Select>
            </div>
          </div>
        </div>

        {/* dados da prorrogação */}
        <div className={sectionCard} style={sectionCardStyle}>
          <p className={sectionTitle} style={{ color: theme.textColor }}>Dados da prorrogação</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div>
              <label className={label} style={labelStyle}>Data da Solicitação</label>
              <Input type="date" required value={form.dataSolicitacao} onChange={set("dataSolicitacao")} {...fieldProps} />
            </div>
            <div>
              <label className={label} style={labelStyle}>Qtd. Diárias Já Utilizadas</label>
              <Input mono type="number" min={0} value={form.qtdDiariasUtilizadas} onChange={set("qtdDiariasUtilizadas")} placeholder="0" {...fieldProps} />
            </div>
            <div>
              <label className={label} style={labelStyle}>Qtd. Diárias Adicionais Solicitadas</label>
              <Input mono required type="number" min={1} value={form.qtdDiariasAdicionaisSolicitadas} onChange={set("qtdDiariasAdicionaisSolicitadas")} placeholder="0" {...fieldProps} />
            </div>
            <div>
              <label className={label} style={labelStyle}>Tipo de Acomodação Solicitada</label>
              <Select value={form.tipoAcomodacaoSolicitada} onChange={set("tipoAcomodacaoSolicitada")} className="w-full" {...fieldProps}>
                {TIPO_ACOMODACAO.map((v) => <option key={v}>{v}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <label className={label} style={labelStyle}>Indicação Clínica</label>
            <Textarea value={form.indicacaoClinica} onChange={set("indicacaoClinica")} rows={3} placeholder="Justifique a necessidade da prorrogação..." {...fieldProps} />
          </div>
        </div>

        {/* procedimentos/diárias solicitadas */}
        <div className={sectionCard} style={sectionCardStyle}>
          <div className="flex items-center justify-between mb-4">
            <p className={sectionTitle} style={{ color: theme.textColor, margin: 0 }}>Procedimentos / diárias solicitadas</p>
            <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={addProcedimento}>
              Adicionar item
            </Button>
          </div>
          <DataTable
            columns={colunasProcedimentos}
            data={form.procedimentos}
            getRowKey={(p) => p.id}
            emptyMessage="Nenhum item adicionado. Clique em “Adicionar item”."
            renderMobileCard={(p) => (
              <div className="space-y-2">
                <Select value={p.tabela} onChange={(e) => updateProcedimento(p.id, "tabela", e.target.value)} className="w-full" {...fieldProps}>
                  {TABELAS.map((t) => <option key={t}>{t}</option>)}
                </Select>
                <Input mono value={p.codigo} onChange={(e) => updateProcedimento(p.id, "codigo", e.target.value)} placeholder="Código TUSS" {...fieldProps} />
                <Input value={p.descricao} onChange={(e) => updateProcedimento(p.id, "descricao", e.target.value)} placeholder="Descrição" {...fieldProps} />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={p.quantidade}
                    onChange={(e) => updateProcedimento(p.id, "quantidade", Number(e.target.value))}
                    className="font-mono text-sm w-20 rounded-lg px-2.5 py-1.5 outline-none"
                    style={{ backgroundColor: C.bgPanelAlt, border: `1px solid ${C.border}`, color: theme.textColor }}
                  />
                  <button
                    type="button"
                    onClick={() => removeProcedimento(p.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: theme.headerControlBg }}
                    aria-label="Remover procedimento"
                  >
                    <Trash2 size={14} style={{ color: C.coral }} />
                  </button>
                </div>
              </div>
            )}
          />
        </div>

        {/* observação */}
        <div className={sectionCard} style={sectionCardStyle}>
          <label className={label} style={labelStyle}>Observação / Justificativa</label>
          <Textarea value={form.observacao} onChange={set("observacao")} rows={3} placeholder="Informações adicionais para a análise..." {...fieldProps} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" icon={Send}>Enviar requisição</Button>
        </div>
      </form>
    </RequisicaoGuiaFormShell>
  );
}
