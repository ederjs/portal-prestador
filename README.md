# Portal do Prestador — Template Front-end

Template React (Vite + Tailwind + lucide-react) com tela de login e shell
de dashboard (header, sidebar com até 3 níveis, seletor de prestador, footer).

## Pré-requisitos

- Node.js 18+ instalado (recomendado usar via WSL/Ubuntu, já que o backend
  também vai rodar em Linux)
- Verifique com:
  ```bash
  node -v
  npm -v
  ```
  Se não tiver Node instalado no WSL, instale via nvm:
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  source ~/.bashrc
  nvm install --lts
  ```

## TypeScript

O projeto usa **TypeScript** (arquivos `.ts`/`.tsx`) em vez de JavaScript puro.
Isso significa:

- Erros de tipo (prop errada, campo esquecido, valor com formato errado)
  aparecem no editor **antes** de rodar o código, não só em produção
- Os modelos do domínio (`Prestador`, `GuiaSolicitada`, `ThemeConfig`, etc.)
  ficam centralizados em `src/types/index.ts` — qualquer novo componente ou
  tela deve importar os tipos de lá em vez de redefinir formas de objeto
- Rodar `npm run typecheck` a qualquer momento verifica o projeto inteiro
  sem gerar arquivos, útil para checar antes de um commit
- O VS Code já entende tudo automaticamente (autocomplete, avisos inline)
  assim que a extensão padrão de TypeScript detectar o projeto — não precisa
  instalar nada além do Node

## Como rodar

1. Extraia o zip e abra a pasta no VS Code (recomendado abrir via WSL:
   `code .` dentro do terminal Ubuntu, na pasta do projeto)

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Rode o projeto em modo desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse no navegador: **http://localhost:5173**

5. Na tela de login, o formulário é apenas mock por enquanto — qualquer
   e-mail válido (ex: `teste@teste.com`) e qualquer senha te levam ao
   dashboard. A autenticação real será plugada depois via Keycloak.

## Build de produção

```bash
npm run build
```
Gera a pasta `dist/` pronta para deploy (servida por Nginx, Apache, ou
dentro de um container Docker no seu pacote on-premise).

## Estrutura

```
portal-prestador/
├── index.html
├── package.json
├── tsconfig.json                      # configuração do TypeScript
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx                       # ponto de entrada, envolve o app no ThemeProvider
    ├── App.tsx                        # shell: header, sidebar, footer, roteamento entre páginas
    ├── index.css                      # diretivas do Tailwind
    ├── vite-env.d.ts                  # tipos globais do Vite
    │
    ├── types/
    │   └── index.ts                   # modelos do domínio: Prestador, GuiaSolicitada, ThemeConfig, MenuNode...
    │
    ├── theme/
    │   ├── colors.ts                  # paleta fixa do design system (C)
    │   ├── ThemeContext.tsx           # contexto React com as cores customizáveis pelo cliente
    │   └── GlobalFonts.tsx            # import das fontes (Google Fonts)
    │
    ├── services/
    │   └── themeApi.ts                # busca as cores de header/sidebar/footer/login/conteúdo numa API
    │
    ├── data/
    │   └── mock.ts                    # PRESTADORES, MENU, GUIAS_*, STATUS_MAP (mock)
    │
    ├── components/
    │   ├── ui/                        # componentes de UI genéricos e reutilizáveis
    │   │   ├── Button.tsx             # único local para estilo de botões do app
    │   │   ├── Input.tsx              # input padrão (com ícone opcional)
    │   │   ├── Select.tsx             # select padrão
    │   │   ├── Textarea.tsx           # textarea padrão
    │   │   └── DataTable.tsx          # tabela genérica (com generics de TS), configurável por colunas + fallback em cards no mobile
    │   ├── StatusBadge.tsx
    │   ├── KpiCard.tsx
    │   ├── MenuItem.tsx               # item de menu recursivo (até 3 níveis)
    │   ├── ProviderModal.tsx          # modal de seleção de prestador com busca
    │   └── NovaSolicitacaoModal.tsx   # formulário de nova solicitação de guia
    │
    └── pages/
        ├── LoginScreen.tsx
        ├── Dashboard.tsx
        └── GuiasSolicitarPage.tsx     # listagem de guias com filtros + tabela/cards
```

### Como funciona a customização de cores pelo cliente

Cada área customizável tem uma cor de **fundo** e uma cor de **texto/ícone**:

| Área | Fundo | Texto/ícone |
|---|---|---|
| Cabeçalho | `theme.headerBg` | `theme.headerText` |
| Menu lateral | `theme.sidebarBg` | `theme.sidebarText` |
| Rodapé | `theme.footerBg` | `theme.footerText` |
| Tela de login | `theme.loginBg` | `theme.loginText` |
| Área de conteúdo | `theme.contentBg` | `theme.contentText` |

Os campos `*Text` controlam apenas os ícones e textos que ficam **direto
sobre o fundo customizável** (título da sidebar, ícones do cabeçalho,
texto do rodapé, título/subtítulo da tela de login, títulos de página no
conteúdo). Elementos dentro de cartões (KPIs, tabelas, formulários) mantêm
a cor fixa do design system, porque o fundo desses cartões também é fixo —
então o contraste sempre fica garantido ali, independente da cor que o
cliente escolher para o restante da tela.

Isso evita o problema clássico de "ícone cinza sumindo num fundo claro":
sempre que o cliente mudar `headerBg` para uma cor clara, por exemplo, ele
também deve setar `headerText` para uma cor escura — e vice-versa.

Todos esses valores vêm do `ThemeContext` (`src/theme/ThemeContext.jsx`),
que por sua vez chama `fetchThemeConfig()` em `src/services/themeApi.ts`.

Hoje esse serviço retorna um mock local (com pequeno delay simulando rede).
Para plugar a API real, edite `src/services/themeApi.ts`: existe um bloco
comentado já pronto, só descomentar e apontar para o endpoint do backend
(ex: `GET /api/tenant/theme`), que deve retornar um JSON no formato:

```json
{
  "headerBg": "#0E2242",
  "sidebarBg": "#0E2242",
  "footerBg": "#0E2242",
  "loginBg": "#0A1930",
  "contentBg": "#0A1930",
  "headerText": "#8FA3C0",
  "sidebarText": "#EAF0F8",
  "footerText": "#5D7699",
  "loginText": "#EAF0F8",
  "contentText": "#EAF0F8",
  "accent": "#CDCD00",
  "logoUrl": null
}
```

Nenhum componente visual precisa mudar — todos consomem essas cores via
`useTheme()`. Para testar valores diferentes agora, sem precisar de backend,
edite o objeto `DEFAULT_THEME` no topo de `src/services/themeApi.ts`.

### Como funciona a padronização de UI

Qualquer botão, input, select, textarea ou tabela do app deve usar os
componentes de `src/components/ui/`. Trocar o visual desses elementos em
todo o sistema (cor, raio de borda, espaçamento, peso de fonte) é uma
edição em um arquivo só — não precisa caçar estilo espalhado pelas telas.

## Próximos passos sugeridos

- Substituir o formulário de login mock pela integração real com Keycloak
  (via `keycloak-js` ou `react-oidc-context`)
- Conectar KPIs e tabela de guias aos endpoints reais do backend Spring Boot
- Conectar a lista de prestadores vinculados ao endpoint
  `GET /prestadores/vinculados` do backend
