# Especificação — Portal do Prestador (Front-end)

Portal web para hospitais/prestadores acessarem uma operadora de plano de
saúde: solicitar guias, acompanhar autorizações e enviar produção médica.

---

## 1. Stack técnica

- **React 18** + **TypeScript** (strict mode)
- **Vite** como build tool/dev server
- **Tailwind CSS** (apenas classes utilitárias core — sem compilador JIT
  customizado, então evitar sintaxe arbitrária tipo `bg-[#fff]`; cores
  customizadas vão via `style` inline)
- **lucide-react** para ícones
- Sem lib de rotas nem state management externo (`useState` nativo é
  suficiente no estágio atual — ver seção 8 para evolução futura)

---

## 2. Identidade visual

**Direção de design:** azul-marinho profundo como base, bronze como cor de
assinatura (evita o clichê azul+ciano de dashboard genérico). Paleta com
significado semântico para status.

### Paleta fixa do design system (`src/theme/colors.ts`)

| Token | Hex | Uso |
|---|---|---|
| `bgBase` | `#0A1930` | fundo geral da aplicação |
| `bgPanel` | `#0E2242` | header/sidebar/footer (fallback) |
| `bgPanelAlt` | `#122A4E` | inputs, botões-chip |
| `bgCard` | `#132C52` | cartões (fallback) |
| `border` / `borderSoft` | `#213C60` / `#1A3050` | bordas e divisores |
| `bronze` / `bronzeSoft` | `#CDCD00` | cor de assinatura/accent |
| `teal` / `tealSoft` | `#35AC9E` | status positivo (autorizada) |
| `amber` / `amberSoft` | `#D9A441` | status pendente (em análise) |
| `coral` / `coralSoft` | `#E2624F` | status negativo (negada/glosa) |
| `textPrimary` / `textMuted` / `textFaint` | `#EAF0F8` / `#8FA3C0` / `#5D7699` | tokens legados, hoje usados só como fallback interno de `Input`/`Select`/`Textarea` e nas variantes `secondary`/`ghost` de `Button` — texto de tela em geral usa `theme.textColor` (ver seção 3) |

### Tipografia (Google Fonts, via `GlobalFonts.tsx`)

- **Manrope** (500/700/800) — títulos e display (`font-display`)
- **Inter** (400/500/600) — texto de interface (`font-body`)
- **IBM Plex Mono** (500) — dados tabulares/códigos: números de guia,
  CNPJ, carteirinha (`font-mono`)

### Princípios de ícone no menu

Ícones só no **1º nível** do menu (padrão Fiori/Salesforce) — ajuda a
escanear categorias sem poluir subníveis, que ficam só com indentação.
Ícones do menu sempre em opacidade cheia (100%) — nada de ícone
esmaecido/acinzentado, mesmo quando o item não está ativo.

---

## 3. Sistema de tema customizável pelo cliente (multi-tenant)

O cliente (operadora) pode customizar cores via API, sem precisar alterar
código. Implementado com Context API + serviço de fetch.

### Arquitetura

```
src/services/themeApi.ts   → busca config na API (mock hoje, pronto pra API real)
src/theme/ThemeContext.tsx → Context Provider, expõe useTheme()
src/types/index.ts         → interface ThemeConfig
```

`main.tsx` envolve `<App />` em `<ThemeProvider>`. Qualquer componente
acessa via `const { theme } = useTheme()`.

### Campos do `ThemeConfig` (todos customizáveis via API)

| Campo | Controla |
|---|---|
| `headerBg` | fundo do cabeçalho |
| `sidebarBg` | fundo do menu lateral |
| `footerBg` | fundo do rodapé |
| `loginBg` | fundo da tela de login |
| `contentBg` | fundo da área de conteúdo |
| `loginCardBg` | fundo do cartão de login |
| `contentCardBg` | fundo dos cartões pós-login (KPIs, tabelas, modais, "Meus dados", filtros) |
| `loginButtonBg` / `loginButtonText` | fundo / texto do botão de SSO na tela de login |
| `headerControlBg` | fundo dos botões-chip (busca, hambúrguer, notificação, informações, colapsar/fechar menu) |
| `avatarBg` / `avatarText` | fundo / texto do círculo de avatar do usuário |
| `accent` | cor de destaque geral (reservado para uso futuro) |
| **`textColor`** | **campo único de cor de fonte para o app inteiro** — títulos e subtítulos de tela, labels de campo de formulário, cabeçalho e conteúdo de tabelas (desktop e fallback mobile), campos de busca (header e filtros), dados do cabeçalho (seletor de prestador, notificações, menu do usuário), rodapé e conteúdo de todos os modais. Padrão `#FFFFFF` |
| `logoUrl` | logo customizado (campo pronto, ainda não renderizado) |

### Regra de design importante

A cor de fonte do app é controlada **por um único campo (`textColor`)**,
não mais por um campo `*Text` separado para cada área — trocar esse
valor muda a fonte em todas as telas de uma vez.

Ficam **fora** dessa unificação, por serem elementos sobre fundo colorido
próprio (badge/botão, não texto corrido) e por isso precisarem de
contraste dedicado, calculado à parte:
- `avatarText` — cor do texto sobre o círculo de avatar (`avatarBg`)
- `loginButtonText` — cor do texto sobre o botão de SSO (`loginButtonBg`)
- Cores semânticas de status (`teal`/`amber`/`coral` — autorizada/em
  análise/negada) e a cor de ação "Sair" (`coral`) — não são texto
  informativo, seguem sempre a paleta fixa de `colors.ts`

Elementos **dentro** de um cartão (inputs, selects, textareas) recebem
`bg`/`textColor` explicitamente daquele cartão (`contentCardBg` +
`theme.textColor`) — não há herança automática de cor.

### Integração real (pendente)

Em `src/services/themeApi.ts`, dentro de `fetchThemeConfig()`, existe um
bloco comentado pronto:
```ts
// const response = await fetch("/api/tenant/theme");
// const data = await response.json();
// return { ...DEFAULT_THEME, ...data };
```
Só descomentar e apontar para o endpoint do backend (`GET /api/tenant/theme`,
que deve devolver um JSON no formato de `ThemeConfig`, incluindo o campo
`textColor`). Nenhum componente visual precisa mudar.

---

## 4. Estrutura de pastas

```
src/
├── main.tsx                 # entry point, envolve App em ThemeProvider
├── App.tsx                  # shell: header, sidebar, footer, roteamento simples
├── index.css                # diretivas Tailwind
├── vite-env.d.ts
│
├── types/
│   └── index.ts              # Prestador, GuiaSolicitada, GuiaResumo, GuiaStatus,
│                              # MenuNode, ThemeConfig, ColorPalette, StatusInfo
│
├── theme/
│   ├── colors.ts              # paleta fixa (C)
│   ├── ThemeContext.tsx       # Context + useTheme()
│   └── GlobalFonts.tsx        # import das fontes
│
├── services/
│   └── themeApi.ts            # fetch do tema (mock + integração real comentada)
│
├── data/
│   └── mock.ts                # PRESTADORES (54, simulando 50+), MENU, GUIAS_*,
│                               # STATUS_MAP — todo mock do projeto centralizado aqui
│
├── components/
│   ├── ui/                    # design system genérico — trocar estilo = 1 arquivo
│   │   ├── Button.tsx         # variants: primary/secondary/ghost/danger + bg/textColor override
│   │   ├── Input.tsx          # aceita icon, bg, textColor
│   │   ├── Select.tsx         # aceita bg, textColor
│   │   ├── Textarea.tsx       # aceita bg, textColor
│   │   └── DataTable.tsx      # genérica com generics TS: DataTable<T>, columns config,
│   │                          # fallback automático em cards no mobile (<sm), fonte
│   │                          # de cabeçalho/conteúdo via theme.textColor
│   ├── StatusBadge.tsx        # pill colorido por GuiaStatus
│   ├── KpiCard.tsx            # card de indicador (ícone, valor, delta) — título e valor
│   │                          # em theme.textColor
│   ├── MenuItem.tsx           # item de menu recursivo, até 3 níveis — ícones e labels
│   │                          # em opacidade cheia
│   ├── ProviderModal.tsx      # modal de seleção de prestador com busca (50+ registros)
│   └── NovaSolicitacaoModal.tsx  # formulário de nova guia
│
└── pages/
    ├── LoginScreen.tsx
    ├── Dashboard.tsx
    └── GuiasSolicitarPage.tsx
```

**Princípio:** todo botão/input/select/textarea/tabela do app usa os
componentes de `components/ui/` — trocar aparência globalmente é editar um
arquivo só, nunca caçar estilo espalhado pelo código.

---

## 5. Telas e fluxos

### 5.1 Login (`LoginScreen.tsx`)

- Layout **centralizado** (sem painel lateral com imagem) — cartão único
  sobre fundo com leve glow decorativo bronze
- Título "Portal do Prestador" em destaque (`text-3xl`), sem ícone acima
- **Botão de SSO corporativo** em destaque no topo do cartão (ícone
  escudo, estado de loading com spinner) — local exato para plugar
  `window.location.href = keycloak.createLoginUrl()` já comentado no código
- Divisor "ou entre com e-mail"
- Campos de e-mail/senha (senha com toggle mostrar/ocultar), "manter
  conectado", "esqueci senha"
- Hoje o form é mock: qualquer valor válido autentica (`onLogin()` direto)
- Todo texto da tela (título, subtítulo, labels, divisor, disclaimer)
  usa `theme.textColor`

### 5.2 Shell pós-login (`App.tsx`)

**Header:**
- Busca global (oculta em telas <lg) — ícone e texto digitado em `theme.textColor`
- Botão hambúrguer (visível apenas <lg, abre drawer da sidebar)
- **Seletor de prestador** — elemento de destaque (pill com indicador
  pulsante), abre o `ProviderModal`; nome e CNPJ do prestador em `theme.textColor`
- Notificações (badge de contagem, dropdown com lista) — texto do dropdown em `theme.textColor`
- Informações (placeholder, sem conteúdo ainda)
- Avatar do usuário (dropdown: nome, perfil, "Meu perfil", "Sair") — texto do
  dropdown em `theme.textColor` (exceto "Sair", que mantém a cor semântica coral)

**Sidebar:**
- Logo + título "Portal do Prestador" (`theme.textColor`) — **somem juntos** ao colapsar
- Botão de colapsar no topo (desktop) / botão de fechar no topo (mobile,
  drawer) — não mais no rodapé
- Menu recursivo até 3 níveis (ver estrutura abaixo) — ícones e labels em
  opacidade cheia, sem esmaecimento
- Em telas <lg vira **drawer** com backdrop escurecido, fecha ao
  selecionar item ou clicar fora

**Footer:**
- Copyright + versão/ambiente, layout responsivo (empilha no mobile) — texto em `theme.textColor`

**Estrutura do menu:**
```
Dashboard
Guias
├── Solicitar guia
├── Guias em análise
└── Histórico
Produção médica
├── Enviar lote
└── Lotes enviados
    ├── Pendentes
    ├── Processados
    └── Com glosa
Financeiro
├── Faturamento
└── Glosas
Prestadores
├── Meus prestadores
└── Contratos
Configurações
├── Usuários
└── Meu perfil
```

### 5.3 Dashboard (`Dashboard.tsx`)

- Saudação + prestador ativo em destaque
- 4 KPI cards (guias em análise, autorizadas hoje, produção enviada no
  mês, glosas em aberto) — cada um com ícone, valor, delta de variação;
  título e valor do card em `theme.textColor` (sem esmaecimento)
- Tabela "Guias recentes" (via `DataTable`) — cabeçalho e conteúdo em `theme.textColor`
- Card "Meus dados" (avatar, perfil, prestador ativo, nº de prestadores
  vinculados, último acesso) — todo texto em `theme.textColor`

### 5.4 Solicitar guia (`GuiasSolicitarPage.tsx`)

- Filtros: busca por beneficiário, busca por código da guia, select de
  prestador — label "Filtros", ícone e campos em `theme.textColor`
- **Tabela** (≥sm): beneficiário + carteirinha, código, data, prestador,
  status — cabeçalho de coluna e todo o conteúdo (incluindo data e
  prestador) em `theme.textColor`
- **Cards** (<sm, mobile): só nome do beneficiário + código da guia +
  status (resumo mínimo, conforme pedido) — texto em `theme.textColor`
- Botão "Nova solicitação" → abre `NovaSolicitacaoModal` (beneficiário,
  carteirinha, prestador, tipo de guia, procedimento TUSS, observações) —
  ao enviar, insere a guia no topo da listagem localmente (sem backend
  ainda)

### 5.5 Modal de seleção de prestador (`ProviderModal.tsx`)

Criado especificamente para suportar clientes com **50+ prestadores
vinculados** a um único login: campo de busca (nome/cidade/CNPJ), lista
rolável, contador de resultados. Selecionar fecha o modal e atualiza o
prestador ativo no header. Todo texto do modal (título, subtítulo, itens
da lista, contador, estado vazio) em `theme.textColor`.

---

## 6. Responsividade

| Breakpoint | Comportamento |
|---|---|
| `< sm` (mobile) | Sidebar em drawer; tabelas viram lista de cards resumidos |
| `sm` – `lg` (tablet) | Sidebar em drawer (hambúrguer no header); busca do header oculta; grids de KPI/filtros em 1-2 colunas |
| `≥ lg` (desktop) | Sidebar fixa e colapsável; busca visível; grids completos |

---

## 7. Modelos de dados (`src/types/index.ts`)

```ts
interface Prestador { id: number; nome: string; cnpj: string; cidade: string; }

type GuiaStatus = "autorizada" | "analise" | "negada";

interface GuiaResumo { numero: string; paciente: string; tipo: string; status: GuiaStatus; data: string; }

interface GuiaSolicitada {
  id: number; codigo: string; beneficiario: string; carteirinha: string;
  dataSolicitacao: string; prestadorNome: string; status: GuiaStatus;
}

interface MenuNode { id: string; label: string; icon?: LucideIcon; children?: MenuNode[]; }

interface ThemeConfig { /* ver seção 3 — inclui o campo único textColor */ }
```

---

## 8. O que é mock hoje (pontos de integração futura)

| Item | Mock atual | Integração real prevista |
|---|---|---|
| Autenticação | `onLogin()` direto, sem validação | Keycloak via OIDC (`keycloak-js` ou `react-oidc-context`), botão SSO já preparado |
| Lista de prestadores | 54 registros gerados em `mock.ts` | `GET /prestadores/vinculados` |
| Guias (dashboard e listagem) | Arrays estáticos em `mock.ts` | `GET /guias`, `POST /guias` |
| Tema visual | `DEFAULT_THEME` local | `GET /api/tenant/theme` |
| Notificações | Lista fixa de 3 itens | endpoint de notificações + WebSocket/polling |
| Roteamento | `activeItem` (string state) trocando conteúdo do `<main>` | React Router (ou similar) quando o número de telas crescer |

---

## 9. Convenções de código

- Todo componente novo recebe tipos explícitos de props (interface `XProps`)
- Cores nunca hardcoded em componentes de tela — sempre via `C` (fixo) ou
  `theme` (customizável pelo cliente)
- **Cor de fonte:** nunca usar opacidade para "esmaecer" texto informativo
  (título, label, dado de tabela, cabeçalho/rodapé/modal) — todo texto de
  tela usa `theme.textColor` a 100% de opacidade. Opacidade reduzida em
  texto só é aceitável para elementos verdadeiramente decorativos (ex.:
  chevron de expandir/recolher no menu)
- Campos de formulário (`Input`/`Select`/`Textarea`) usados dentro de um
  cartão **sempre** recebem `bg` daquele cartão e `textColor={theme.textColor}`
  explicitamente (não há herança automática de cor)
- Arquivos de dado mock ficam só em `data/mock.ts` — nunca inline nas telas
- `DataTable<T>` é a única forma de listar dados tabulares; ao criar uma
  nova tela de listagem, reaproveitar esse componente em vez de montar
  tabela manualmente

---

## 10. Próximos passos sugeridos

1. Integrar autenticação real via Keycloak (Realm `operadora-saude`,
   client `portal-hospitais`)
2. Conectar todas as chamadas mock a endpoints reais do backend Spring Boot
3. Adicionar roteamento real (URLs por tela) quando o número de páginas
   justificar
4. Implementar upload de anexos na `NovaSolicitacaoModal` (laudos/exames)
5. Completar telas ainda placeholder no menu (Guias em análise, Histórico,
   Produção médica, Financeiro, Prestadores, Configurações)
