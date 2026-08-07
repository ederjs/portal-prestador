import React, { useState } from "react";
import { Send } from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import { PRESTADORES } from "../data/mock";
import RequisicaoGuiaFormShell from "../components/RequisicaoGuiaFormShell";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";

interface RequisicaoGuiaConsultaPageProps {
  onCancel: () => void;
}

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];
const CONSELHOS = ["CRM", "CRO", "COREN", "CREFITO", "CRP", "CRF", "CRN", "CRBM"];
const INDICACAO_ACIDENTE = ["Não Acidente", "Acidente de Trânsito", "Acidente de Trabalho Típico", "Outros Acidentes"];
const COBERTURA_ESPECIAL = ["Não se aplica", "Doença ou Lesão Preexistente (DLP)", "Cobertura Parcial Temporária (CPT)", "Urgência/Emergência"];
const REGIME_ATENDIMENTO = ["Ambulatorial", "Hospitalar", "Domiciliar", "Home Care"];
const SAUDE_OCUPACIONAL = ["Não se aplica", "Admissional", "Demissional", "Periódico", "Retorno ao Trabalho", "Mudança de Função"];
const TIPO_CONSULTA = ["Primeira vez", "Seguimento", "Pré-natal", "Por concentração/rotina", "Retorno"];
const TABELAS = ["22 - Procedimentos e Eventos em Saúde (TUSS)", "18 - Procedimentos Odontológicos", "19 - Diárias e Taxas"];

interface FormState {
  registroAns: string;
  numeroGuiaPrestador: string;
  numeroGuiaOperadora: string;
  numeroCarteira: string;
  validadeCarteira: string;
  atendimentoRn: string;
  nomeSocial: string;
  nome: string;
  codigoOperadora: string;
  contratadoId: number;
  codigoCnes: string;
  profissionalExecutante: string;
  conselhoProfissional: string;
  numeroConselho: string;
  uf: string;
  codigoCbo: string;
  indicacaoAcidente: string;
  coberturaEspecial: string;
  regimeAtendimento: string;
  saudeOcupacional: string;
  dataAtendimento: string;
  tipoConsulta: string;
  tabela: string;
  codigoProcedimento: string;
  valorProcedimento: string;
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
  atendimentoRn: "Não",
  nomeSocial: "",
  nome: "",
  codigoOperadora: "",
  contratadoId: PRESTADORES[0].id,
  codigoCnes: "",
  profissionalExecutante: "",
  conselhoProfissional: CONSELHOS[0],
  numeroConselho: "",
  uf: "SC",
  codigoCbo: "",
  indicacaoAcidente: INDICACAO_ACIDENTE[0],
  coberturaEspecial: COBERTURA_ESPECIAL[0],
  regimeAtendimento: REGIME_ATENDIMENTO[0],
  saudeOcupacional: SAUDE_OCUPACIONAL[0],
  dataAtendimento: "",
  tipoConsulta: TIPO_CONSULTA[0],
  tabela: TABELAS[0],
  codigoProcedimento: "",
  valorProcedimento: "",
  observacao: "",
};

/**
 * Formulário da Guia TISS de Consulta — segue a numeração de campos do
 * layout padrão ANS/TISS (Guia de Consulta), agrupado nas mesmas seções
 * do formulário em papel: identificação da guia, dados do beneficiário,
 * dados do contratado e dados do atendimento/procedimento realizado.
 */
export default function RequisicaoGuiaConsultaPage({ onCancel }: RequisicaoGuiaConsultaPageProps) {
  const { theme } = useTheme();
  const [form, setForm] = useState<FormState>(() => ({
    ...FORM_INICIAL,
    numeroGuiaPrestador: gerarNumeroGuiaPrestador(),
  }));

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // mock — sem backend ainda; ao integrar, enviar `form` para POST /guias/consulta
    onCancel();
  };

  const fieldProps = { bg: theme.contentCardBg, textColor: theme.textColor };
  const label = "font-body text-xs font-medium block mb-1.5";
  const labelStyle: React.CSSProperties = { color: theme.textColor };
  const sectionTitle = "font-body text-xs font-semibold uppercase tracking-wide mb-4";
  const sectionCard = "rounded-xl p-4 sm:p-5";
  const sectionCardStyle = { backgroundColor: theme.contentCardBg, border: `1px solid ${C.borderSoft}` };

  return (
    <RequisicaoGuiaFormShell title="Guia Consulta" onCancel={onCancel}>
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
            <div>
              <label className={label} style={labelStyle}>Atendimento a RN</label>
              <Select value={form.atendimentoRn} onChange={set("atendimentoRn")} className="w-full" {...fieldProps}>
                <option>Não</option>
                <option>Sim</option>
              </Select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={label} style={labelStyle}>Nome Social</label>
              <Input value={form.nomeSocial} onChange={set("nomeSocial")} placeholder="Se houver" {...fieldProps} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={label} style={labelStyle}>Nome</label>
              <Input required value={form.nome} onChange={set("nome")} placeholder="Nome completo do beneficiário" {...fieldProps} />
            </div>
          </div>
        </div>

        {/* dados do contratado */}
        <div className={sectionCard} style={sectionCardStyle}>
          <p className={sectionTitle} style={{ color: theme.textColor }}>Dados do contratado</p>
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
            <div>
              <label className={label} style={labelStyle}>Código CNES</label>
              <Input mono value={form.codigoCnes} onChange={set("codigoCnes")} placeholder="0000000" {...fieldProps} />
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <label className={label} style={labelStyle}>Nome do Profissional Executante</label>
              <Input required value={form.profissionalExecutante} onChange={set("profissionalExecutante")} placeholder="Nome do profissional" {...fieldProps} />
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

        {/* dados do atendimento / procedimento realizado */}
        <div className={sectionCard} style={sectionCardStyle}>
          <p className={sectionTitle} style={{ color: theme.textColor }}>Dados do atendimento / procedimento realizado</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className={label} style={labelStyle}>Indicação de Acidente</label>
              <Select value={form.indicacaoAcidente} onChange={set("indicacaoAcidente")} className="w-full" {...fieldProps}>
                {INDICACAO_ACIDENTE.map((v) => <option key={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className={label} style={labelStyle}>Indicador de Cobertura Especial</label>
              <Select value={form.coberturaEspecial} onChange={set("coberturaEspecial")} className="w-full" {...fieldProps}>
                {COBERTURA_ESPECIAL.map((v) => <option key={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className={label} style={labelStyle}>Regime de Atendimento</label>
              <Select value={form.regimeAtendimento} onChange={set("regimeAtendimento")} className="w-full" {...fieldProps}>
                {REGIME_ATENDIMENTO.map((v) => <option key={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className={label} style={labelStyle}>Saúde Ocupacional</label>
              <Select value={form.saudeOcupacional} onChange={set("saudeOcupacional")} className="w-full" {...fieldProps}>
                {SAUDE_OCUPACIONAL.map((v) => <option key={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className={label} style={labelStyle}>Data do Atendimento</label>
              <Input type="date" required value={form.dataAtendimento} onChange={set("dataAtendimento")} {...fieldProps} />
            </div>
            <div>
              <label className={label} style={labelStyle}>Tipo de Consulta</label>
              <Select value={form.tipoConsulta} onChange={set("tipoConsulta")} className="w-full" {...fieldProps}>
                {TIPO_CONSULTA.map((v) => <option key={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className={label} style={labelStyle}>Tabela</label>
              <Select value={form.tabela} onChange={set("tabela")} className="w-full" {...fieldProps}>
                {TABELAS.map((v) => <option key={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label className={label} style={labelStyle}>Código do Procedimento</label>
              <Input mono required value={form.codigoProcedimento} onChange={set("codigoProcedimento")} placeholder="Código TUSS" {...fieldProps} />
            </div>
            <div>
              <label className={label} style={labelStyle}>Valor do Procedimento</label>
              <Input mono value={form.valorProcedimento} onChange={set("valorProcedimento")} placeholder="R$ 0,00" {...fieldProps} />
            </div>
          </div>
        </div>

        {/* observação / justificativa */}
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
