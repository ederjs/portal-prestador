import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  DOMÍNIO                                                            */
/* ------------------------------------------------------------------ */
export interface Prestador {
  id: number;
  nome: string;
  cnpj: string;
  cidade: string;
  endereco: string;
  telefone: string;
  tipoVinculo: string;
}

export type GuiaStatus = "autorizada" | "analise" | "negada";

export interface GuiaResumo {
  numero: string;
  paciente: string;
  tipo: string;
  status: GuiaStatus;
  data: string;
}

export interface GuiaSolicitada {
  id: number;
  codigo: string;
  beneficiario: string;
  carteirinha: string;
  dataSolicitacao: string;
  prestadorNome: string;
  status: GuiaStatus;
}

export interface StatusInfo {
  label: string;
  color: string;
  bg: string;
}

/** Registro simplificado de beneficiário usado pelo componente
 *  LocalizadorBeneficiario (modal de busca/seleção). */
export interface BeneficiarioBusca {
  carteira: string;
  nome: string;
  nomeSocial: string;
  cpf: string;
  dataNascimento: string; // dd/mm/aaaa
  situacao: "Apto" | "Inapto" | "Suspenso";
}

/** As 5 guias TISS requisitáveis a partir da tela "Requisitar guia" e dos
 *  atalhos de acesso rápido no Dashboard. */
export type RequisicaoGuiaFormId =
  | "consulta"
  | "spsadt"
  | "internacao"
  | "prorrogacao"
  | "odontologico";

/* ------------------------------------------------------------------ */
/*  INFORMAÇÕES TISS (card do Dashboard)                               */
/* ------------------------------------------------------------------ */
export interface TissContato {
  nome: string;
  email: string;
  telefone: string;
}

export interface TissLink {
  label: string;
  url: string;
}

export interface TissWebservice {
  descricao: string;
  endereco: string;
}

export interface TissInfo {
  coordenadores: TissContato[];
  suplente: TissContato;
  links: TissLink[];
  webservices: TissWebservice[];
}

/* ------------------------------------------------------------------ */
/*  MENU (sidebar recursiva, até 3 níveis)                             */
/* ------------------------------------------------------------------ */
export interface MenuNode {
  id: string;
  label: string;
  icon?: LucideIcon;
  children?: MenuNode[];
}

/* ------------------------------------------------------------------ */
/*  TEMA CUSTOMIZÁVEL PELO CLIENTE (via API)                           */
/* ------------------------------------------------------------------ */
export interface ThemeConfig {
  headerBg: string;
  sidebarBg: string;
  footerBg: string;
  loginBg: string;
  contentBg: string;
  loginCardBg: string;
  contentCardBg: string;
  loginButtonBg: string;
  loginButtonText: string;
  headerControlBg: string;
  avatarBg: string;
  avatarText: string;
  accent: string;
  /** Cor única de fonte usada em todo o app: títulos, subtítulos, labels de
   *  formulário, cabeçalhos/conteúdo de tabela, campos de busca, dados do
   *  cabeçalho, rodapé e modais. Alterar este campo muda a cor do texto em
   *  todas as telas de uma vez (ver seção 3 da espec / themeApi.ts). */
  textColor: string;
  logoUrl: string | null;
}

/* ------------------------------------------------------------------ */
/*  PALETA FIXA DO DESIGN SYSTEM                                       */
/* ------------------------------------------------------------------ */
export interface ColorPalette {
  bgBase: string;
  bgPanel: string;
  bgPanelAlt: string;
  bgCard: string;
  border: string;
  borderSoft: string;
  bronze: string;
  bronzeSoft: string;
  teal: string;
  tealSoft: string;
  coral: string;
  coralSoft: string;
  amber: string;
  amberSoft: string;
  textPrimary: string;
  textMuted: string;
  textFaint: string;
}
