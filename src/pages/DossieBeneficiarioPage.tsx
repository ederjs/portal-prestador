import React, { useState } from "react";
import { Search, User, UserSearch } from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import DataTable, { type Column } from "../components/ui/DataTable";
import LocalizadorBeneficiario from "../components/LocalizadorBeneficiario";

interface ProdutoContratado {
  codigo: string;
  nomeFantasia: string;
  segmentacaoAssistencial: string;
  regulamentacao: string;
  protocoloAns: string;
  codAnterior: string;
  tipoContratacao: string;
  situacao: string;
  formacaoPreco: string;
  fatorModerador: string;
  acomodacoes: string;
  abrangenciaGeografica: string;
}

interface RegistroCpt {
  codigo: string;
  cobertura: string;
  dataValidade: string;
}

interface RegistroSca {
  codSca: string;
  sca: string;
  seqTabela: string;
  tabelaPreco: string;
  contrato: string;
}

interface RegistroCarencia {
  codigo: string;
  carencia: string;
  dtVigencia: string;
  qtDias: number;
  dtValidade: string;
  isento: "S" | "N";
}

interface BeneficiarioDossie {
  carteira: string;
  nomeExibicao: string;
  nomeCompleto: string;
  dataNascimento: string; // dd/mm/aaaa
  validadeCarteirinha: string;
  contrato: string;
  estipulante: string;
  subEstipulante: string;
  dtAdesao: string;
  dtIncOperadora: string;
  dtLiberacao: string;
  dtLimiteUtilizacao: string;
  dtMigracao: string;
  dtSuspensao: string;
  dtReativacao: string;
  dtDevCarteira: string;
  dtRescisao: string;
  canalVenda: string;
  titular: string;
  situacaoAtendimento: string;
  produto: ProdutoContratado;
  cpt: RegistroCpt[];
  sca: RegistroSca[];
  carencias: RegistroCarencia[];
}

// procedimentos da tabela TUSS tipicamente sujeitos a CPT (cobertura parcial
// temporária) — usados para sortear os registros de CPT do beneficiário
const PROCEDIMENTOS_TUSS_CPT: Array<{ codigo: string; cobertura: string; mesesCpt: number }> = [
  { codigo: "31309013", cobertura: "Ressonância magnética de coluna", mesesCpt: 24 },
  { codigo: "40902040", cobertura: "Prótese ortopédica", mesesCpt: 24 },
  { codigo: "31602018", cobertura: "Cirurgia de hérnia inguinal", mesesCpt: 24 },
  { codigo: "30716016", cobertura: "Histerectomia total", mesesCpt: 24 },
  { codigo: "40101015", cobertura: "Colecistectomia videolaparoscópica", mesesCpt: 24 },
  { codigo: "31009018", cobertura: "Angioplastia coronariana", mesesCpt: 24 },
  { codigo: "20103035", cobertura: "Artroscopia de joelho", mesesCpt: 24 },
];

// soma meses a uma data no formato dd/mm/aaaa, devolvendo no mesmo formato
function adicionarMeses(dataBr: string, meses: number): string {
  const [dia, mes, ano] = dataBr.split("/").map(Number);
  const data = new Date(ano, mes - 1 + meses, dia);
  return data.toLocaleDateString("pt-BR");
}

// soma dias a uma data no formato dd/mm/aaaa, devolvendo no mesmo formato
function adicionarDias(dataBr: string, dias: number): string {
  const [dia, mes, ano] = dataBr.split("/").map(Number);
  const data = new Date(ano, mes - 1, dia + dias);
  return data.toLocaleDateString("pt-BR");
}

// sorteia 3 procedimentos da tabela TUSS e calcula a validade da CPT a
// partir da data de adesão do beneficiário
function gerarRegistrosCpt(dtAdesao: string): RegistroCpt[] {
  const embaralhados = [...PROCEDIMENTOS_TUSS_CPT].sort(() => Math.random() - 0.5);
  return embaralhados.slice(0, 3).map((item) => ({
    codigo: item.codigo,
    cobertura: item.cobertura,
    dataValidade: adicionarMeses(dtAdesao, item.mesesCpt),
  }));
}

// tabelas de SCA (Sistema de Cobertura Assistencial) tipicamente vinculadas
// ao produto do beneficiário
const SCA_POOL: Array<{ codSca: string; sca: string; seqTabela: string }> = [
  { codSca: "122", sca: "Serviço Odontológico Master", seqTabela: "10244" },
  { codSca: "129", sca: "SCA - Enfermaria", seqTabela: "10237" },
  { codSca: "131", sca: "SCA - Apartamento", seqTabela: "10238" },
  { codSca: "140", sca: "SCA - UTI", seqTabela: "10250" },
];

// sorteia 2 registros de SCA e monta a descrição da tabela de preço com o
// nome/carteira do beneficiário, no mesmo padrão do print de referência
function gerarRegistrosSca(carteira: string, nomeCompleto: string): RegistroSca[] {
  const embaralhados = [...SCA_POOL].sort(() => Math.random() - 0.5);
  return embaralhados.slice(0, 2).map((item) => ({
    codSca: item.codSca,
    sca: item.sca,
    seqTabela: item.seqTabela,
    tabelaPreco: `Tabela para o beneficiário ${carteira} - Teste nova solicitação (${nomeCompleto})`,
    contrato: "3270 - Hospital do Brasil Ltda",
  }));
}

// carências típicas de contratos de planos de saúde, usadas para sortear os
// registros exibidos na aba Carências
const CARENCIAS_POOL: Array<{ codigo: string; carencia: string; qtDias: number }> = [
  { codigo: "248", carencia: "Acomodação - Apartamento", qtDias: 120 },
  { codigo: "483", carencia: "Internações", qtDias: 5 },
  { codigo: "301", carencia: "Consultas", qtDias: 0 },
  { codigo: "356", carencia: "Exames de alta complexidade", qtDias: 180 },
  { codigo: "412", carencia: "Parto a termo", qtDias: 300 },
];

// sorteia 2 registros de carência a partir da data de vigência do contrato,
// calculando a validade como vigência + qtDias
function gerarRegistrosCarencia(dtVigencia: string): RegistroCarencia[] {
  const embaralhados = [...CARENCIAS_POOL].sort(() => Math.random() - 0.5);
  return embaralhados.slice(0, 2).map((item) => ({
    codigo: item.codigo,
    carencia: item.carencia,
    dtVigencia,
    qtDias: item.qtDias,
    dtValidade: adicionarDias(dtVigencia, item.qtDias),
    isento: item.qtDias === 0 ? "S" : "N",
  }));
}

// mock — retorna sempre o mesmo beneficiário de referência, com a carteira
// informada; sem backend ainda (ver seção 8 da espec)
function buscarBeneficiario(carteira: string): BeneficiarioDossie {
  const dtAdesao = "04/10/2022";
  return {
    carteira,
    nomeExibicao: "Joana Castro",
    nomeCompleto: "Joana Castro",
    dataNascimento: "24/01/1990",
    validadeCarteirinha: "10/04/2094",
    contrato: "90",
    estipulante: "A. de Sousa Silva - Me",
    subEstipulante: "",
    dtAdesao,
    dtIncOperadora: "04/10/2022",
    dtLiberacao: "06/10/2022",
    dtLimiteUtilizacao: "",
    dtMigracao: "",
    dtSuspensao: "",
    dtReativacao: "02/04/2026",
    dtDevCarteira: "",
    dtRescisao: "",
    canalVenda: "Joseane",
    titular: "",
    situacaoAtendimento: "Apto",
    produto: {
      codigo: "79",
      nomeFantasia: "",
      segmentacaoAssistencial: "Ambulatorial + Hospitalar com Obstetrícia",
      regulamentacao: "Pós",
      protocoloAns: "",
      codAnterior: "",
      tipoContratacao: "Coletivo por adesão",
      situacao: "Ativo",
      formacaoPreco: "Em pré-pagamento (Quantidade de beneficiário)",
      fatorModerador: "",
      acomodacoes: "Individual",
      abrangenciaGeografica: "Estadual",
    },
    cpt: gerarRegistrosCpt(dtAdesao),
    sca: gerarRegistrosSca(carteira, "Joana Castro"),
    carencias: gerarRegistrosCarencia("01/09/2025"),
  };
}

// calcula idade no formato "36a 6m 5dias" a partir de dd/mm/aaaa
function calcularIdade(dataNascimentoBr: string, hoje: Date = new Date()): string {
  const [dia, mes, ano] = dataNascimentoBr.split("/").map(Number);
  const nascimento = new Date(ano, mes - 1, dia);

  let anos = hoje.getFullYear() - nascimento.getFullYear();
  let meses = hoje.getMonth() - nascimento.getMonth();
  let dias = hoje.getDate() - nascimento.getDate();

  if (dias < 0) {
    meses -= 1;
    const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
    dias += ultimoDiaMesAnterior;
  }
  if (meses < 0) {
    anos -= 1;
    meses += 12;
  }
  return `${anos}a ${meses}m ${dias}dias`;
}

type SecaoArvore = "dados" | "carencias" | "sca" | "cpt";

/**
 * Tela "Dossiê do Beneficiário" (menu Beneficiário). Busca por código da
 * carteira (ao sair do campo), árvore à esquerda (nome do beneficiário >
 * Carências / SCA / CPT) e painel de detalhes à direita — layout dos
 * campos reorganizado a partir do print de referência para caber no
 * design system do portal.
 */
export default function DossieBeneficiarioPage() {
  const { theme } = useTheme();
  const [carteira, setCarteira] = useState("");
  const [beneficiario, setBeneficiario] = useState<BeneficiarioDossie | null>(null);
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoArvore>("dados");
  const [localizadorAberto, setLocalizadorAberto] = useState(false);
  // quando true, o campo "Código da carteira" exibe "código - nome" no lugar
  // do código puro; volta a false assim que o usuário clica no campo para editar
  const [mostrandoResultado, setMostrandoResultado] = useState(false);

  const cardStyle = { backgroundColor: theme.contentCardBg, border: `1px solid ${C.borderSoft}` };
  const label = "font-body text-xs font-medium block mb-1.5";
  const labelStyle: React.CSSProperties = { color: theme.textColor };

  const handleBuscar = () => {
    if (!carteira.trim()) {
      setBeneficiario(null);
      setMostrandoResultado(false);
      return;
    }
    setBeneficiario(buscarBeneficiario(carteira.trim()));
    setSecaoAtiva("dados");
    setMostrandoResultado(true);
  };

  const handleSelecionarDoLocalizador = ({ nome, carteira: carteiraEscolhida }: { nome: string; carteira: string }) => {
    setCarteira(carteiraEscolhida);
    const dados = buscarBeneficiario(carteiraEscolhida);
    // sobrescreve o nome do mock fixo pelo nome escolhido no localizador,
    // para o campo "Código da carteira" refletir "código - nome" corretamente
    setBeneficiario({ ...dados, nomeCompleto: nome, nomeExibicao: nome });
    setSecaoAtiva("dados");
    setMostrandoResultado(true);
  };

  const campo = (rotulo: string, valor?: string) => (
    <div>
      <p className="font-body text-xs mb-1" style={{ color: theme.textColor }}>{rotulo}</p>
      <p className="font-body text-sm font-semibold" style={{ color: theme.textColor }}>{valor || "—"}</p>
    </div>
  );

  const colunasCpt: Column<RegistroCpt>[] = [
    { key: "codigo", header: "Código", mono: true },
    { key: "cobertura", header: "Cobertura" },
    {
      key: "dataValidade",
      header: "Data validade",
      render: (item) => <span className="font-mono text-sm" style={{ color: theme.textColor }}>{item.dataValidade}</span>,
    },
  ];

  const colunasSca: Column<RegistroSca>[] = [
    { key: "codSca", header: "Cód SCA", mono: true },
    { key: "sca", header: "SCA" },
    { key: "seqTabela", header: "Seq Tabela", mono: true },
    { key: "tabelaPreco", header: "Tabela Preço" },
    { key: "contrato", header: "Contrato" },
  ];

  const colunasCarencias: Column<RegistroCarencia>[] = [
    { key: "codigo", header: "Código", mono: true },
    { key: "carencia", header: "Carência" },
    { key: "dtVigencia", header: "Dt vigência", mono: true },
    {
      key: "qtDias",
      header: "Qt dias",
      render: (item) => <span className="font-mono text-sm" style={{ color: theme.textColor }}>{item.qtDias}</span>,
    },
    { key: "dtValidade", header: "Dt validade", mono: true },
    { key: "isento", header: "Isento", mono: true },
  ];

  const abaSecao = (id: SecaoArvore, texto: string) => (
    <button
      onClick={() => setSecaoAtiva(id)}
      className="rounded-lg px-4 py-2 font-body text-sm transition-colors"
      style={{
        color: secaoAtiva === id ? C.bronze : theme.textColor,
        backgroundColor: secaoAtiva === id ? C.bronzeSoft : "transparent",
        border: `1px solid ${secaoAtiva === id ? C.bronze : C.borderSoft}`,
        fontWeight: secaoAtiva === id ? 700 : 500,
      }}
    >
      {texto}
    </button>
  );

  const tituloBloco = (texto: string) => (
    <div className="mb-4">
      <p className="font-body text-sm font-bold pb-2" style={{ color: theme.textColor }}>
        {texto}
      </p>
      <div className="border-b" style={{ borderColor: theme.textColor }} />
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold" style={{ color: theme.textColor }}>
          Dossiê do Beneficiário
        </h1>
        <p className="font-body text-sm mt-1" style={{ color: theme.textColor }}>
          Informe o código da carteira para consultar os dados do beneficiário
        </p>
      </div>

      {/* busca */}
      <div className="rounded-xl p-4 sm:p-5 mb-5" style={cardStyle}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className={label} style={labelStyle}>Código da carteira</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <Input
                  mono
                  icon={Search}
                  value={mostrandoResultado && beneficiario ? `${carteira} - ${beneficiario.nomeCompleto}` : carteira}
                  onFocus={() => setMostrandoResultado(false)}
                  onChange={(e) => setCarteira(e.target.value)}
                  onBlur={handleBuscar}
                  placeholder="Ex: 200780"
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
          </div>
          <div>
            <p className="font-body text-xs mb-1" style={{ color: theme.textColor }}>Nome</p>
            <p className="font-body text-sm font-semibold" style={{ color: theme.textColor }}>
              {beneficiario ? beneficiario.nomeCompleto : "—"}
            </p>
          </div>
          <div>
            <p className="font-body text-xs mb-1" style={{ color: theme.textColor }}>Data de nascimento / Idade</p>
            <p className="font-mono text-sm font-semibold" style={{ color: theme.textColor }}>
              {beneficiario
                ? `${beneficiario.dataNascimento} · ${calcularIdade(beneficiario.dataNascimento)}`
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* navegação por abas */}
      <div className="rounded-xl p-3 mb-4" style={cardStyle}>
        {beneficiario ? (
          <nav className="flex flex-wrap gap-2">
            {abaSecao("dados", beneficiario.nomeExibicao)}
            {abaSecao("carencias", "Carências")}
            {abaSecao("sca", "SCA")}
            {abaSecao("cpt", "CPT")}
          </nav>
        ) : (
          <div className="flex flex-col items-center text-center py-8 px-3">
            <User size={22} style={{ color: C.bronze }} className="mb-2" />
            <p className="font-body text-xs" style={{ color: theme.textColor }}>
              Informe a carteira acima para ver os dados do beneficiário
            </p>
          </div>
        )}
      </div>

      {/* detalhes */}
      <div className="w-full rounded-xl p-5" style={cardStyle}>
        {!beneficiario && (
            <p className="font-body text-sm text-center py-10" style={{ color: theme.textColor }}>
              Nenhum beneficiário carregado.
            </p>
          )}

          {beneficiario && secaoAtiva === "dados" && (
            <div className="space-y-6">
              <div>
                {tituloBloco(`Beneficiário: ${beneficiario.nomeExibicao} (${beneficiario.nomeCompleto})`)}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  {campo("Carteira", beneficiario.carteira)}
                  {campo("Validade carteirinha", beneficiario.validadeCarteirinha)}
                  {campo("Situação atendimento", beneficiario.situacaoAtendimento)}
                  {campo("Contrato", beneficiario.contrato)}
                  {campo("Estipulante", beneficiario.estipulante)}
                  {campo("Sub estipulante", beneficiario.subEstipulante)}
                  {campo("Titular", beneficiario.titular)}
                  {campo("Canal de venda", beneficiario.canalVenda)}
                  {campo("Dt adesão", beneficiario.dtAdesao)}
                  {campo("Dt inc operadora", beneficiario.dtIncOperadora)}
                  {campo("Dt liberação", beneficiario.dtLiberacao)}
                  {campo("Dt limite utilização", beneficiario.dtLimiteUtilizacao)}
                  {campo("Dt migração", beneficiario.dtMigracao)}
                  {campo("Dt suspensão", beneficiario.dtSuspensao)}
                  {campo("Dt reativação", beneficiario.dtReativacao)}
                  {campo("Dt dev carteira", beneficiario.dtDevCarteira)}
                  {campo("Dt rescisão", beneficiario.dtRescisao)}
                </div>
              </div>

              <div>
                {tituloBloco(`Produto Contratado: (${beneficiario.produto.codigo})`)}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  {campo("Nome fantasia", beneficiario.produto.nomeFantasia)}
                  {campo("Tipo contratação", beneficiario.produto.tipoContratacao)}
                  {campo("Situação", beneficiario.produto.situacao)}
                  {campo("Segmentação assistencial", beneficiario.produto.segmentacaoAssistencial)}
                  {campo("Regulamentação", beneficiario.produto.regulamentacao)}
                  {campo("Protocolo ANS", beneficiario.produto.protocoloAns)}
                  {campo("Cód anterior", beneficiario.produto.codAnterior)}
                  {campo("Formação de preço", beneficiario.produto.formacaoPreco)}
                  {campo("Fator moderador", beneficiario.produto.fatorModerador)}
                  {campo("Acomodações", beneficiario.produto.acomodacoes)}
                  {campo("Abrangência geografia", beneficiario.produto.abrangenciaGeografica)}
                </div>
              </div>
            </div>
          )}

          {beneficiario && secaoAtiva === "cpt" && (
            <div>
              {tituloBloco("CPT")}
              <DataTable
                columns={colunasCpt}
                data={beneficiario.cpt}
                getRowKey={(item) => item.codigo}
                emptyMessage="Nenhum registro de CPT para este beneficiário."
                renderMobileCard={(item) => (
                  <div>
                    <p className="font-mono text-xs" style={{ color: theme.textColor }}>{item.codigo}</p>
                    <p className="font-body text-sm" style={{ color: theme.textColor }}>{item.cobertura}</p>
                    <p className="font-mono text-xs mt-1" style={{ color: theme.textColor }}>Validade: {item.dataValidade}</p>
                  </div>
                )}
              />
            </div>
          )}

          {beneficiario && secaoAtiva === "sca" && (
            <div>
              {tituloBloco("SCA")}
              <DataTable
                columns={colunasSca}
                data={beneficiario.sca}
                getRowKey={(item) => item.codSca}
                emptyMessage="Nenhum registro de SCA para este beneficiário."
                renderMobileCard={(item) => (
                  <div>
                    <p className="font-mono text-xs" style={{ color: theme.textColor }}>{item.codSca} · {item.seqTabela}</p>
                    <p className="font-body text-sm font-semibold" style={{ color: theme.textColor }}>{item.sca}</p>
                    <p className="font-body text-xs mt-1" style={{ color: theme.textColor }}>{item.tabelaPreco}</p>
                    <p className="font-body text-xs mt-1" style={{ color: theme.textColor }}>{item.contrato}</p>
                  </div>
                )}
              />
            </div>
          )}

          {beneficiario && secaoAtiva === "carencias" && (
            <div>
              {tituloBloco("Carências")}
              <DataTable
                columns={colunasCarencias}
                data={beneficiario.carencias}
                getRowKey={(item) => item.codigo}
                emptyMessage="Nenhum registro de carência para este beneficiário."
                renderMobileCard={(item) => (
                  <div>
                    <p className="font-mono text-xs" style={{ color: theme.textColor }}>{item.codigo}</p>
                    <p className="font-body text-sm font-semibold" style={{ color: theme.textColor }}>{item.carencia}</p>
                    <p className="font-mono text-xs mt-1" style={{ color: theme.textColor }}>
                      {item.dtVigencia} · {item.qtDias} dias · válido até {item.dtValidade}
                    </p>
                    <p className="font-body text-xs mt-1" style={{ color: theme.textColor }}>Isento: {item.isento}</p>
                  </div>
                )}
              />
            </div>
          )}
        </div>

      <LocalizadorBeneficiario
        open={localizadorAberto}
        onClose={() => setLocalizadorAberto(false)}
        onSelect={handleSelecionarDoLocalizador}
      />
    </div>
  );
}

