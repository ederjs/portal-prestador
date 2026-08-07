import type { ThemeConfig } from "../types";

/**
 * Serviço de tema — busca as cores customizáveis pelo cliente a partir de
 * uma API: fundo de cada área (cabeçalho, sidebar, rodapé, login,
 * conteúdo), cor dos cartões (login e conteúdo), do botão de SSO no
 * login, dos controles do cabeçalho (busca, notificação, informações) e
 * do avatar de perfil.
 *
 * A cor de fonte (títulos, labels, tabelas, busca, cabeçalho, rodapé e
 * modais) é controlada por um único campo, `textColor`, aplicado em todo
 * o app — não há mais um campo "*Text" por área.
 *
 * Estrutura pronta para produção: troque a implementação de `fetchThemeConfig`
 * por uma chamada real ao backend (ex: GET /api/tenant/theme) sem precisar
 * mexer em nenhum componente — todos consomem o tema via ThemeContext.
 *
 * Formato esperado da API (JSON):
 * {
 *   "headerBg": "#0E2242",
 *   "sidebarBg": "#0E2242",
 *   "footerBg": "#0E2242",
 *   "loginBg": "#0A1930",
 *   "contentBg": "#0A1930",
 *   "loginCardBg": "#132C52",
 *   "contentCardBg": "#132C52",
 *   "loginButtonBg": "#122A4E",
 *   "loginButtonText": "#FFFFFF",
 *   "headerControlBg": "#122A4E",
 *   "avatarBg": "#CDCD00",
 *   "avatarText": "#0A1930",
 *   "accent": "#CDCD00",
 *   "textColor": "#FFFFFF",
 *   "logoUrl": null
 * }
 *
 * `textColor` é o campo único que controla a cor de fonte em todo o app
 * (títulos, subtítulos, labels de formulário, cabeçalho/conteúdo de
 * tabela, campos de busca, dados do cabeçalho, rodapé e modais). Para
 * mudar a cor do texto do portal inteiro, basta alterar esse valor.
 */

const THEME_ENDPOINT = "/api/tenant/theme";

// valores usados enquanto a API não responde, ou caso ela falhe
// (reproduzem visualmente o tema escuro padrão do app)
export const DEFAULT_THEME: ThemeConfig = {
  headerBg: "#0E2242",
  sidebarBg: "#0E2242",
  footerBg: "#0E2242",
  loginBg: "#0A1930",
  contentBg: "#0A1930",
  loginCardBg: "#132C52",
  contentCardBg: "#132C52",
  loginButtonBg: "#122A4E",
  loginButtonText: "#FFFFFF",
  headerControlBg: "#122A4E",
  avatarBg: "#FFA54F",
  avatarText: "#0A1930",
  accent: "#FFA54F",
  // campo único: muda a cor de fonte em todas as telas do app de uma vez
  textColor: "#FFFFFF",
  logoUrl: null,
};

export async function fetchThemeConfig(): Promise<ThemeConfig> {
  try {
    // --- integração real (descomentar quando o endpoint existir) ---
    // const response = await fetch(THEME_ENDPOINT);
    // if (!response.ok) throw new Error(`Falha ao buscar tema: ${response.status}`);
    // const data: Partial<ThemeConfig> = await response.json();
    // return { ...DEFAULT_THEME, ...data };

    // --- mock local, simula latência de rede ---
    await new Promise((resolve) => setTimeout(resolve, 300));

    // >>> PARA TESTAR AGORA: troque os valores abaixo (ou os de cima em
    // DEFAULT_THEME) para ver o tema mudando sem precisar de backend <<<
    return { ...DEFAULT_THEME };
  } catch (err) {
    console.error("Erro ao carregar tema do cliente, usando padrão:", err);
    return DEFAULT_THEME;
  }
}
