import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  Wallet,
  Building2,
  Settings,
  UserSearch,
} from "lucide-react";
import { C } from "../theme/colors";
import type { Prestador, MenuNode, StatusInfo, GuiaStatus, GuiaResumo, GuiaSolicitada, TissInfo, BeneficiarioBusca } from "../types";

/* ------------------------------------------------------------------ */
/*  PRESTADORES                                                        */
/* ------------------------------------------------------------------ */
const BASE_PRESTADORES: Array<{ nome: string; cidade: string; rua: string }> = [
  { nome: "Hospital Santa Catarina", cidade: "Blumenau/SC", rua: "Rua XV de Novembro" },
  { nome: "Clínica São Lucas", cidade: "Itajaí/SC", rua: "Rua Hercílio Luz" },
  { nome: "Hospital Regional do Vale", cidade: "Gaspar/SC", rua: "Rua Getúlio Vargas" },
  { nome: "Hospital e Maternidade Bom Pastor", cidade: "Brusque/SC", rua: "Rua Otto Renaux" },
  { nome: "Clínica Vida Nova", cidade: "Pomerode/SC", rua: "Rua Hermann Weege" },
  { nome: "Hospital Municipal São José", cidade: "Timbó/SC", rua: "Rua Ângelo Rossi" },
  { nome: "Centro Médico Águas Claras", cidade: "Indaial/SC", rua: "Rua Emílio Baumgart" },
  { nome: "Instituto de Ortopedia do Vale", cidade: "Rio do Sul/SC", rua: "Rua Ministro Vivaldo Lima" },
  { nome: "Hospital Nossa Senhora Auxiliadora", cidade: "Jaraguá do Sul/SC", rua: "Rua Reinoldo Rau" },
  { nome: "Clínica Cardiológica Litoral", cidade: "Balneário Camboriú/SC", rua: "Avenida Atlântica" },
];

const TIPOS_VINCULO = ["Rede Própria", "Credenciado", "Cooperado"];

// gera uma base ampla de prestadores para simular clientes com muitos vínculos (50+)
export const PRESTADORES: Prestador[] = Array.from({ length: 54 }).map((_, i) => {
  const base = BASE_PRESTADORES[i % BASE_PRESTADORES.length];
  const sufixo = Math.floor(i / BASE_PRESTADORES.length);
  return {
    id: i + 1,
    nome: sufixo > 0 ? `${base.nome} — Unidade ${sufixo + 1}` : base.nome,
    cnpj: `${String(10 + i).padStart(2, "0")}.${String(300 + i * 7).padStart(3, "0")}.${String(100 + i * 3).padStart(3, "0")}/0001-${String(10 + (i % 90)).padStart(2, "0")}`,
    cidade: base.cidade,
    endereco: `${base.rua}, ${100 + i * 3} - Centro, ${base.cidade}`,
    telefone: `(47) 3${String(200 + i).padStart(3, "0")}-${String(1000 + i * 13).padStart(4, "0")}`,
    tipoVinculo: TIPOS_VINCULO[i % TIPOS_VINCULO.length],
  };
});

/* ------------------------------------------------------------------ */
/*  MENU (sidebar, até 3 níveis)                                       */
/* ------------------------------------------------------------------ */
export const MENU: MenuNode[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    id: "beneficiario",
    label: "Beneficiário",
    icon: UserSearch,
    children: [
      { id: "beneficiario-dossie", label: "Dossiê do Beneficiário" },
      { id: "beneficiario-cadastro-digital", label: "Cadastro de digital" },
    ],
  },
  {
    id: "guias",
    label: "Guia TISS",
    icon: FileText,
    children: [
      { id: "guias-solicitar", label: "Requisitar Guia" },
      { id: "guias-analise", label: "Consultar requisições" },
      { id: "guias-executadas", label: "Consultar guias executadas" },
      {
        id: "guias-execucao",
        label: "Execução de guias",
        children: [
          { id: "guias-execucao-requisicao", label: "Executar requisição" },
          { id: "guias-execucao-cirurgia", label: "Executar cirurgia" },
        ],
      },
    ],
  },
  {
    id: "producao",
    label: "Produção médica",
    icon: UploadCloud,
    children: [
      { id: "producao-enviar", label: "Enviar lote" },
      {
        id: "producao-lotes",
        label: "Lotes enviados",
        children: [
          { id: "producao-pendentes", label: "Pendentes" },
          { id: "producao-processados", label: "Processados" },
          { id: "producao-glosa", label: "Com glosa" },
        ],
      },
    ],
  },
  {
    id: "financeiro",
    label: "Financeiro",
    icon: Wallet,
    children: [
      { id: "financeiro-faturamento", label: "Faturamento" },
      { id: "financeiro-glosas", label: "Glosas" },
    ],
  },
  {
    id: "prestadores",
    label: "Prestadores",
    icon: Building2,
    children: [
      { id: "prestadores-meus", label: "Meus prestadores" },
      { id: "prestadores-contratos", label: "Contratos" },
    ],
  },
  {
    id: "config",
    label: "Configurações",
    icon: Settings,
    children: [
      { id: "config-usuarios", label: "Usuários" },
      { id: "config-perfil", label: "Meu perfil" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  STATUS DE GUIA                                                     */
/* ------------------------------------------------------------------ */
export const STATUS_MAP: Record<GuiaStatus, StatusInfo> = {
  autorizada: { label: "Autorizada", color: C.teal, bg: C.tealSoft },
  analise: { label: "Em análise", color: C.amber, bg: C.amberSoft },
  negada: { label: "Negada", color: C.coral, bg: C.coralSoft },
};

/* ------------------------------------------------------------------ */
/*  GUIAS — dashboard (resumo) e tela de listagem                      */
/* ------------------------------------------------------------------ */
export const GUIAS_RECENTES: GuiaResumo[] = [
  { numero: "GU-208451", paciente: "Marcos A. Ferreira", tipo: "SP/SADT", status: "autorizada", data: "24/07/2026" },
  { numero: "GU-208450", paciente: "Helena B. Souza", tipo: "Internação", status: "analise", data: "24/07/2026" },
  { numero: "GU-208447", paciente: "Ricardo M. Lima", tipo: "SP/SADT", status: "negada", data: "23/07/2026" },
  { numero: "GU-208441", paciente: "Vitória C. Nunes", tipo: "Honorário", status: "autorizada", data: "23/07/2026" },
  { numero: "GU-208438", paciente: "João P. Andrade", tipo: "SP/SADT", status: "analise", data: "22/07/2026" },
];

const NOMES_BENEFICIARIOS: string[] = [
  "Marcos A. Ferreira", "Helena B. Souza", "Ricardo M. Lima", "Vitória C. Nunes",
  "João P. Andrade", "Camila R. Teixeira", "Eduardo S. Martins", "Beatriz L. Rocha",
  "Felipe N. Cardoso", "Larissa V. Pinto", "Gustavo H. Ramos", "Isabela F. Duarte",
  "Rafael T. Barros", "Juliana O. Correia", "Bruno D. Azevedo", "Patrícia M. Gonçalves",
  "Thiago C. Vieira", "Amanda K. Moreira", "Diego P. Castro", "Fernanda R. Costa",
];

// gera lista de guias solicitadas para popular a tela de listagem
// (86 registros — o suficiente para exercitar a paginação de 30 em 30 na
// tela "Consultar requisições")
export const GUIAS_SOLICITADAS: GuiaSolicitada[] = Array.from({ length: 86 }).map((_, i) => {
  const beneficiario = NOMES_BENEFICIARIOS[i % NOMES_BENEFICIARIOS.length];
  const prestador = PRESTADORES[i % 12];
  const statusOptions: GuiaStatus[] = ["autorizada", "analise", "negada"];
  const dia = 26 - (i % 20);
  return {
    id: i + 1,
    codigo: `GU-${208500 - i * 3}`,
    beneficiario,
    carteirinha: `${String(700 + i).padStart(3, "0")}.${String(1000 + i * 11).padStart(4, "0")}.${String(10 + (i % 90)).padStart(2, "0")}`,
    dataSolicitacao: `${String(dia).padStart(2, "0")}/07/2026`,
    prestadorNome: prestador.nome,
    status: statusOptions[i % 3],
  };
});

/* ------------------------------------------------------------------ */
/*  BENEFICIÁRIOS — usado pelo LocalizadorBeneficiario                  */
/* ------------------------------------------------------------------ */
export const BENEFICIARIOS: BeneficiarioBusca[] = [
  { carteira: "200780", nome: "Joana Castro", nomeSocial: "Joana Castro", cpf: "123.456.780-01", dataNascimento: "24/01/1990", situacao: "Apto" },
  { carteira: "200781", nome: "Marcos Antônio Ferreira", nomeSocial: "", cpf: "234.567.891-02", dataNascimento: "12/03/1985", situacao: "Apto" },
  { carteira: "200782", nome: "Helena Beatriz Souza", nomeSocial: "", cpf: "345.678.912-03", dataNascimento: "02/11/1978", situacao: "Apto" },
  { carteira: "200783", nome: "Ricardo Moreira Lima", nomeSocial: "", cpf: "456.789.123-04", dataNascimento: "19/06/1992", situacao: "Inapto" },
  { carteira: "200784", nome: "Vitória Cardoso Nunes", nomeSocial: "", cpf: "567.891.234-05", dataNascimento: "30/09/2001", situacao: "Apto" },
  { carteira: "200785", nome: "João Pedro Andrade", nomeSocial: "", cpf: "678.912.345-06", dataNascimento: "05/02/1988", situacao: "Suspenso" },
  { carteira: "200786", nome: "Camila Rocha Teixeira", nomeSocial: "", cpf: "789.123.456-07", dataNascimento: "14/07/1995", situacao: "Apto" },
  { carteira: "200787", nome: "Eduardo Silva Martins", nomeSocial: "", cpf: "891.234.567-08", dataNascimento: "22/12/1983", situacao: "Apto" },
  { carteira: "200788", nome: "Beatriz Lopes Rocha", nomeSocial: "", cpf: "912.345.678-09", dataNascimento: "08/04/1997", situacao: "Inapto" },
  { carteira: "200789", nome: "Felipe Nogueira Cardoso", nomeSocial: "", cpf: "123.456.789-10", dataNascimento: "27/10/1990", situacao: "Apto" },
  { carteira: "200790", nome: "Larissa Vieira Pinto", nomeSocial: "", cpf: "234.567.890-11", dataNascimento: "16/05/1993", situacao: "Apto" },
  { carteira: "200791", nome: "Gustavo Henrique Ramos", nomeSocial: "", cpf: "345.678.901-12", dataNascimento: "01/01/1980", situacao: "Suspenso" },
  { carteira: "200792", nome: "Isabela Fontes Duarte", nomeSocial: "", cpf: "456.789.012-13", dataNascimento: "09/08/1996", situacao: "Apto" },
  { carteira: "200793", nome: "Rafael Teixeira Barros", nomeSocial: "", cpf: "567.890.123-14", dataNascimento: "23/02/1989", situacao: "Apto" },
  { carteira: "200794", nome: "Juliana Oliveira Correia", nomeSocial: "", cpf: "678.901.234-15", dataNascimento: "11/11/1994", situacao: "Inapto" },
  { carteira: "200795", nome: "Bruno Dutra Azevedo", nomeSocial: "", cpf: "789.012.345-16", dataNascimento: "17/04/1982", situacao: "Apto" },
  { carteira: "200796", nome: "Patrícia Mendes Gonçalves", nomeSocial: "", cpf: "890.123.456-17", dataNascimento: "03/06/1991", situacao: "Suspenso" },
  { carteira: "200797", nome: "Thiago Cavalcante Vieira", nomeSocial: "", cpf: "901.234.567-18", dataNascimento: "28/09/1987", situacao: "Apto" },
  { carteira: "200798", nome: "Amanda Kelly Moreira", nomeSocial: "", cpf: "012.345.678-19", dataNascimento: "06/12/1999", situacao: "Apto" },
  { carteira: "200799", nome: "Diego Pereira Castro", nomeSocial: "", cpf: "123.457.890-20", dataNascimento: "20/03/1986", situacao: "Inapto" },
];

/* ------------------------------------------------------------------ */
/*  INFORMAÇÕES TISS — card do Dashboard                               */
/* ------------------------------------------------------------------ */
export const TISS_INFO: TissInfo = {
  coordenadores: [
    { nome: "Joana Castro", email: "pedro.gaspar@hospital.com", telefone: "+55 (48) 99908-0735" },
    { nome: "Ederson Silva", email: "ederson@email.com", telefone: "+55 (48) 99908-0735" },
  ],
  suplente: { nome: "Joana Castro", email: "pedro.gaspar@hospital.com", telefone: "+55 (48) 99908-0735" },
  links: [
    { label: "Manuais de preenchimento e instruções do padrão TISS", url: "#" },
    { label: "Processo de elegibilidade e faturamento do padrão TISS", url: "#" },
    { label: "Consulta ao padrão TISS", url: "#" },
  ],
  webservices: [
    { descricao: "tissVerificaElegibilidade", endereco: "https://seuendereco:porta.com.br/TISS40100OPS/tissVerificaElegibilidade" },
    { descricao: "tissSolicitacaoStatusAutorizacao", endereco: "https://seuendereco:porta.com.br/TISS40100OPS/tissSolicitacaoStatusAutorizacao" },
  ],
};
