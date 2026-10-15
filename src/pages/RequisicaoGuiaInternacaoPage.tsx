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

interface RequisicaoGuiaInternacaoPageProps {
  onCancel: () => void;
}

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];
const CONSELHOS = ["CRM", "CRO", "COREN", "CREFITO", "CRP", "CRF", "CRN", "CRBM"];
const CARATER_ATENDIMENTO = ["Eletivo", "Urgência/Emergência"];
const TIPO_INTERNACAO = ["Clínica", "Cirúrgica", "Obstétrica", "Pediátrica", "Psiquiátrica", "Hospital Dia"];
const REGIME_INTERNACAO = ["Hospitalar", "Hospital Dia", "Domiciliar"];
const INDICACAO_ACIDENTE = ["Não Acidente", "Acidente de Trânsito", "Acidente de Trabalho Típico", "Outros Acidentes"];
const SIM_NAO = ["Não", "Sim"];
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
  numeroCarteira: string;
  validadeCarteira: string;
  nomeSocial: string;
  nome: string;
  codigoOperadora: string;
  contratadoSolicitanteId: number;
  profissionalSolicitante: string;
  conselhoProfissional: string;
  numeroConselho: string;
  uf: string;
  codigoCbo: string;
  dataSolicitacao: string;
  caraterAtendimento: string;
  tipoInternacao: string;
  regimeInternacao: string;
  qtdDiariasSolicitadas: string;
  previsaoUsoOpme: string;
  previsaoUsoQuimioterapico: string;
  indicacaoClinica: string;
  codigoCnesHospital: string;
  hospitalSolicitadoId: number;
  codigoCid10: string;
  descricaoCid10: string;
  indicacaoAcidente: string;
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
  numeroCarteira: "",
  validadeCarteira: "",
  nomeSocial: "",
  nome: "",
  codigoOperadora: "",
  contratadoSolicitanteId: PRESTADORES[0].id,
  profissionalSolicitante: "",
  conselhoProfissional: CONSELHOS[0],
  numeroConselho: "",
  uf: "SC",
  codigoCbo: "",
  dataSolicitacao: "",
  caraterAtendimento: CARATER_ATENDIMENTO[0],
  tipoInternacao: TIPO_INTERNACAO[0],
  regimeInternacao: REGIME_INTERNACAO[0],
  qtdDiariasSolicitadas: "",
  previsaoUsoOpme: SIM_NAO[0],
  previsaoUsoQuimioterapico: SIM_NAO[0],
  indicacaoClinica: "",
  codigoCnesHospital: "",
  hospitalSolicitadoId: PRESTADORES[0].id,
  codigoCid10: "",
  descricaoCid10: "",
  indicacaoAcidente: INDICACAO_ACIDENTE[0],
  procedimentos: [],
  observacao: "",
};

/**
 * Formulário da Guia TISS de Solicitação de Internação — segue as seções
 * do layout padrão ANS/TISS: identificação da guia, dados do beneficiário,
 * dados do solicitante, dados da solicitação de internação (caráter, tipo,
 * regime, diárias, OPME/quimioterápico), hospital solicitado, CID-10 e os
 * procedimentos solicitados (podem ser vários).
 */
export default function RequisicaoGuiaInternacaoPage({ onCancel }: RequisicaoGuiaInternacaoPageProps) {
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
    // mock — sem backend ainda; ao integrar, enviar `form` para POST /guias/internacao
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
        <Input value={p.descricao} onChange={(e) => updateProcedimento(p.id, "descricao", e.target.value)} placeholder="Descrição do procedimento" {...fieldProps} />
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
    <RequisicaoGuiaFormShell title="Guia Internação" onCancel={onCancel}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* identificação da guia */}
        <div className={sectionCard} style={sectionCardStyle}>
          <p className={sectionTitle} style={{ color: theme.textColor }}>Identificação da guia</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          </div>
        </div>

        {/* dados do beneficiário */}
        <div className={sectionCard} style={sectionCardStyle}>
          <p className={sectionTitle} style={{ color: theme.textColor }}>Dados do beneficiário</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className={label} style={labelStyle}>Número da Carteira</label>
              <Input mono required value={form.numeroCarteira} onChange={set("numeroCarteira")} placeholder="000.0000.00" {...fieldProps} />
            </div>
            <div>
              <label className={label} style={labelStyle}>Validade da Carteira</label>
              <Input type="date" value={form.validadeCarteira} onChange={set("validadeCarteira")} {...fieldProps} />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className={label} style={labelStyle}>Nome Social</label>
              <Input value={form.nomeSocial} onChange={set("nomeSocial")} placeholder="Se houver" {...fieldProps} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
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
              <Select value={form.contratadoSolicitanteId} onChange={set("contratadoSolicitanteId")} className="w-full" {...fieldProps}>
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
            <div>
              <label className={label} style={labelStyle}>Código CBO</label>
              <Input mono value={form.codigoCbo} onChange={set("codigoCbo")} placeholder="000000" {...fieldProps} />
            </div>
          </div>
        </div>

        {/* dados da solicitação de internação */}
        <div className={sectionCard} style={sectionCardStyle}>
          <p className={sectionTitle} style={{ color: theme.textColor }}>Dados da solicitação de internação</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            <div>
              <label className={label} style={labelStyle}>Data da Solicitação</label>
              <Input type="date" required value={form.dataSolicitacao} onChange={set("dataSolicitacao")} {...fieldProps} />
            </div>
            <div>
              <label className={label} style={labelStyle}>Caráter do Atendimento</label>
              <Select value={form.caraterAtendimento} onChange={set("caraterAtendimento")} className="w-full" {...fieldProps}>
                {CARATER_ATENDIMENTO.map((v) => <option key={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className={label} style={labelStyle}>Tipo de Internação</label>
              <Select value={form.tipoInternacao} onChange={set("tipoInternacao")} className="w-full" {...fieldProps}>
                {TIPO_INTERNACAO.map((v) => <option key={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className={label} style={labelStyle}>Regime de Internação</label>
              <Select value={form.regimeInternacao} onChange={set("regimeInternacao")} className="w-full" {...fieldProps}>
                {REGIME_INTERNACAO.map((v) => <option key={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className={label} style={labelStyle}>Qtd. Diárias Solicitadas</label>
              <Input mono type="number" min={1} value={form.qtdDiariasSolicitadas} onChange={set("qtdDiariasSolicitadas")} placeholder="0" {...fieldProps} />
            </div>
            <div>
              <label className={label} style={labelStyle}>Previsão de Uso de OPME</label>
              <Select value={form.previsaoUsoOpme} onChange={set("previsaoUsoOpme")} className="w-full" {...fieldProps}>
                {SIM_NAO.map((v) => <option key={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className={label} style={labelStyle}>Previsão de Uso de Quimioterápico</label>
              <Select value={form.previsaoUsoQuimioterapico} onChange={set("previsaoUsoQuimioterapico")} className="w-full" {...fieldProps}>
                {SIM_NAO.map((v) => <option key={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className={label} style={labelStyle}>Indicação de Acidente</label>
              <Select value={form.indicacaoAcidente} onChange={set("indicacaoAcidente")} className="w-full" {...fieldProps}>
                {INDICACAO_ACIDENTE.map((v) => <option key={v}>{v}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <label className={label} style={labelStyle}>Indicação Clínica</label>
            <Textarea value={form.indicacaoClinica} onChange={set("indicacaoClinica")} rows={3} placeholder="Descreva a indicação clínica para a internação..." {...fieldProps} />
          </div>
        </div>

        {/* hospital solicitado e CID-10 */}
        <div className={sectionCard} style={sectionCardStyle}>
          <p className={sectionTitle} style={{ color: theme.textColor }}>Hospital solicitado e CID-10</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className={label} style={labelStyle}>Hospital Solicitado</label>
              <Select value={form.hospitalSolicitadoId} onChange={set("hospitalSolicitadoId")} className="w-full" {...fieldProps}>
                {PRESTADORES.slice(0, 20).map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className={label} style={labelStyle}>Código CNES</label>
              <Input mono value={form.codigoCnesHospital} onChange={set("codigoCnesHospital")} placeholder="0000000" {...fieldProps} />
            </div>
            <div>
              <label className={label} style={labelStyle}>Código CID-10</label>
              <Input mono value={form.codigoCid10} onChange={set("codigoCid10")} placeholder="Ex: J45.0" {...fieldProps} />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label className={label} style={labelStyle}>Descrição CID-10</label>
              <Input value={form.descricaoCid10} onChange={set("descricaoCid10")} placeholder="Descrição do diagnóstico" {...fieldProps} />
            </div>
          </div>
        </div>

        {/* procedimentos solicitados */}
        <div className={sectionCard} style={sectionCardStyle}>
          <div className="flex items-center justify-between mb-4">
            <p className={sectionTitle} style={{ color: theme.textColor, margin: 0 }}>Procedimentos solicitados</p>
            <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={addProcedimento}>
              Adicionar procedimento
            </Button>
          </div>
          <DataTable
            columns={colunasProcedimentos}
            data={form.procedimentos}
            getRowKey={(p) => p.id}
            emptyMessage="Nenhum procedimento adicionado. Clique em “Adicionar procedimento”."
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
