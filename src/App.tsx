import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Info,
  User,
  LogOut,
  Menu,
  Search,
  Check,
  Clock,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronDown,
  Building2,
} from "lucide-react";
import { C } from "./theme/colors";
import { useTheme } from "./theme/ThemeContext";
import GlobalFonts from "./theme/GlobalFonts";
import { MENU, PRESTADORES, ALERTAS } from "./data/mock";
import MenuItem from "./components/MenuItem";
import ProviderModal from "./components/ProviderModal";
import AlertaLoginModal from "./components/AlertaLoginModal";
import LoginScreen from "./pages/LoginScreen";
import Dashboard from "./pages/Dashboard";
import ConsultaRequisicoesPage from "./pages/ConsultaRequisicoesPage";
import RequisitarGuiaPage, { type RequisicaoGuiaFormId } from "./pages/RequisitarGuiaPage";
import RequisicaoGuiaConsultaPage from "./pages/RequisicaoGuiaConsultaPage";
import RequisicaoGuiaSAPSADTPage from "./pages/RequisicaoGuiaSAPSADTPage";
import RequisicaoGuiaInternacaoPage from "./pages/RequisicaoGuiaInternacaoPage";
import RequisicaoGuiaProrrogacaoIntPage from "./pages/RequisicaoGuiaProrrogacaoIntPage";
import RequisicaoGuiaOdontologicoPage from "./pages/RequisicaoGuiaOdontologicoPage";
import ExecutarRequisicaoPage from "./pages/ExecutarRequisicaoPage";
import DossieBeneficiarioPage from "./pages/DossieBeneficiarioPage";
import AlertasNotificacoesPage from "./pages/AlertasNotificacoesPage";
import EnviarLotePage from "./pages/EnviarLotePage";
import EmConstrucaoPage from "./pages/EmConstrucaoPage";
import type { Prestador, MenuNode, Alerta } from "./types";

// um alerta aparece no login se estiver ativo e a data de hoje estiver
// dentro do período de vigência (comparação de string funciona pois as
// datas são ISO yyyy-mm-dd, formato nativo do <input type="date">)
function alertaVigente(a: Alerta, hojeIso: string): boolean {
  return a.ativo && a.dataInicioVigencia <= hojeIso && hojeIso <= a.dataFimVigencia;
}

const REQUISICAO_FORM_PAGES: Record<RequisicaoGuiaFormId, React.ComponentType<{ onCancel: () => void }>> = {
  consulta: RequisicaoGuiaConsultaPage,
  spsadt: RequisicaoGuiaSAPSADTPage,
  internacao: RequisicaoGuiaInternacaoPage,
  prorrogacao: RequisicaoGuiaProrrogacaoIntPage,
  odontologico: RequisicaoGuiaOdontologicoPage,
};

// busca recursiva do label de um item de menu pelo id (para o placeholder "Em construção")
function encontrarLabelMenu(id: string, nodes: MenuNode[]): string | undefined {
  for (const node of nodes) {
    if (node.id === id) return node.label;
    if (node.children) {
      const encontrado = encontrarLabelMenu(id, node.children);
      if (encontrado) return encontrado;
    }
  }
  return undefined;
}

export default function App() {
  const { theme } = useTheme(); // cores de header/sidebar/footer/login/conteúdo vindas da API do cliente

  const [loggedIn, setLoggedIn] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState("dashboard");
  const [requisicaoForm, setRequisicaoForm] = useState<RequisicaoGuiaFormId | null>(null);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [provider, setProvider] = useState<Prestador>(PRESTADORES[0]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [alertasLogin, setAlertasLogin] = useState<Alerta[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // fecha os cards de notificações e do usuário ao clicar em qualquer lugar fora deles
  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const handleLogin = () => {
    // sempre que logar, o menu esquerdo deve vir com os grupos fechados e a opção Dashboard selecionada
    setExpanded(new Set());
    setActiveItem("dashboard");
    setRequisicaoForm(null);
    // alertas ativos e dentro da vigência aparecem em modal obrigatório logo após o login
    const hojeIso = new Date().toISOString().slice(0, 10);
    setAlertasLogin(ALERTAS.filter((a) => alertaVigente(a, hojeIso)));
    setLoggedIn(true);
  };

  if (!loggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const toggleMenu = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen w-full flex font-body" style={{ backgroundColor: C.bgBase }}>
      <GlobalFonts />

      {/* backdrop — só em telas < lg, quando o drawer está aberto */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: "rgba(6,13,26,0.65)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR — cor de fundo vem do tema do cliente (theme.sidebarBg) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: 264,
          maxWidth: collapsed && !mobileOpen ? 72 : 264,
          backgroundColor: theme.sidebarBg,
          borderRight: `1px solid ${C.borderSoft}`,
        }}
      >
        <div className="h-16 flex items-center justify-between gap-2.5 px-4 shrink-0" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
          {(!collapsed || mobileOpen) && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: C.bronzeSoft }}>
                <Building2 size={16} style={{ color: C.bronze }} />
              </div>
              <span className="font-display text-sm font-bold truncate" style={{ color: theme.textColor }}>
                Portal do Prestador
              </span>
            </div>
          )}

          {/* recolher menu — desktop */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center shrink-0"
            style={{ backgroundColor: theme.headerControlBg, color: theme.textColor }}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            <ChevronLeft size={14} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>

          {/* fechar drawer — mobile/tablet */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: theme.headerControlBg, color: theme.textColor }}
            aria-label="Fechar menu"
          >
            <X size={14} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {MENU.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              level={0}
              expanded={expanded}
              onToggle={toggleMenu}
              active={activeItem}
              onSelect={(id) => {
                setActiveItem(id);
                setRequisicaoForm(null);
                setMobileOpen(false);
              }}
              collapsed={collapsed && !mobileOpen}
              textColor={theme.textColor}
            />
          ))}
        </nav>
      </aside>

      {/* COLUNA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER — cor de fundo vem do tema do cliente (theme.headerBg) */}
        <header
          className="h-16 shrink-0 flex items-center justify-between px-6 gap-4"
          style={{ backgroundColor: theme.headerBg, borderBottom: `1px solid ${C.borderSoft}` }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: theme.headerControlBg, border: `1px solid ${C.border}` }}
              aria-label="Abrir menu"
            >
              <Menu size={16} style={{ color: theme.textColor }} />
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* seletor de prestador — elemento assinatura, abre modal com busca */}
            <button
              onClick={() => setProviderModalOpen(true)}
              className="flex items-center gap-2.5 pl-3 pr-2.5 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: C.bronzeSoft, border: `1px solid ${C.bronze}44` }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: C.bronze, boxShadow: `0 0 0 3px ${C.bronze}33` }} />
              <div className="text-left leading-tight hidden sm:block">
                <p className="font-body text-[13px] font-semibold truncate max-w-[170px]" style={{ color: theme.textColor }}>
                  {provider.nome}
                </p>
                <p className="font-mono text-[10px]" style={{ color: theme.textColor }}>
                  {provider.cnpj}
                </p>
              </div>
              <Search size={13} className="hidden sm:block ml-auto shrink-0" style={{ color: C.bronze }} />
              <ChevronDown size={14} className="sm:hidden ml-auto shrink-0" style={{ color: C.bronze }} />
            </button>

            <div className="w-px h-6" style={{ backgroundColor: C.borderSoft }} />

            {/* notificações */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.headerControlBg, border: `1px solid ${C.border}` }}
                aria-label="Notificações"
              >
                <Bell size={16} style={{ color: theme.textColor }} />
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-body text-[9px] font-bold"
                  style={{ backgroundColor: C.coral, color: theme.textColor }}
                >
                  3
                </span>
              </button>
              {notifOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden z-20"
                  style={{ backgroundColor: theme.contentCardBg, border: `1px solid ${C.border}`, boxShadow: "0 12px 32px rgba(0,0,0,0.4)" }}
                >
                  <div className="px-4 py-3 font-body text-sm font-semibold" style={{ color: theme.textColor, borderBottom: `1px solid ${C.borderSoft}` }}>
                    Notificações
                  </div>
                  {[
                    { icon: Check, text: "Guia GU-208451 foi autorizada", time: "há 12 min", color: C.teal },
                    { icon: AlertTriangle, text: "Lote #4471 recebeu glosa parcial", time: "há 1h", color: C.coral },
                    { icon: Clock, text: "Guia GU-208450 aguarda análise", time: "há 3h", color: C.amber },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3" style={{ borderBottom: i < 2 ? `1px solid ${C.borderSoft}` : "none" }}>
                      <n.icon size={15} style={{ color: n.color }} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="font-body text-xs" style={{ color: theme.textColor }}>{n.text}</p>
                        <p className="font-body text-[11px] mt-0.5" style={{ color: theme.textColor }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* informações */}
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: theme.headerControlBg, border: `1px solid ${C.border}` }}
              aria-label="Informações"
            >
              <Info size={16} style={{ color: theme.textColor }} />
            </button>

            {/* usuário */}
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setUserMenuOpen((v) => !v)} className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-display text-xs font-bold"
                  style={{ backgroundColor: theme.avatarBg, color: theme.avatarText }}
                >
                  RC
                </div>
              </button>
              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-20"
                  style={{ backgroundColor: theme.contentCardBg, border: `1px solid ${C.border}`, boxShadow: "0 12px 32px rgba(0,0,0,0.4)" }}
                >
                  <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                    <p className="font-body text-sm font-semibold" style={{ color: theme.textColor }}>Renata Camargo</p>
                    <p className="font-body text-xs" style={{ color: theme.textColor }}>Analista administrativo</p>
                  </div>
                  <button className="w-full flex items-center gap-2.5 px-4 py-2.5 font-body text-sm" style={{ color: theme.textColor }}>
                    <User size={15} /> Meu perfil
                  </button>
                  <button
                    onClick={() => setLoggedIn(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 font-body text-sm"
                    style={{ color: C.coral }}
                  >
                    <LogOut size={15} /> Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTEÚDO — roteamento simples entre páginas — cor vem do tema (theme.contentBg) */}
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: theme.contentBg }}>
          {activeItem === "beneficiario-dossie" ? (
            <DossieBeneficiarioPage />
          ) : activeItem === "config-alertas" ? (
            <AlertasNotificacoesPage />
          ) : activeItem === "producao-enviar" ? (
            <EnviarLotePage />
          ) : activeItem === "guias-analise" ? (
            <ConsultaRequisicoesPage />
          ) : activeItem === "guias-execucao-requisicao" ? (
            <ExecutarRequisicaoPage />
          ) : activeItem === "guias-solicitar" ? (
            requisicaoForm ? (
              (() => {
                const FormPage = REQUISICAO_FORM_PAGES[requisicaoForm];
                return <FormPage onCancel={() => setRequisicaoForm(null)} />;
              })()
            ) : (
              <RequisitarGuiaPage onSelect={setRequisicaoForm} />
            )
          ) : activeItem === "dashboard" ? (
            <Dashboard
              provider={provider}
              onOpenGuiaForm={(id) => {
                setActiveItem("guias-solicitar");
                setRequisicaoForm(id);
                setExpanded((prev) => new Set(prev).add("guias"));
              }}
              onOpenExecutarRequisicao={() => {
                setActiveItem("guias-execucao-requisicao");
                setExpanded((prev) => {
                  const next = new Set(prev);
                  next.add("guias");
                  next.add("guias-execucao");
                  return next;
                });
              }}
            />
          ) : (
            <EmConstrucaoPage label={encontrarLabelMenu(activeItem, MENU)} />
          )}
        </main>

        {/* FOOTER — cor de fundo vem do tema do cliente (theme.footerBg) */}
        <footer
          className="shrink-0 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-1"
          style={{ backgroundColor: theme.footerBg, borderTop: `1px solid ${C.borderSoft}` }}
        >
          <p className="font-body text-xs" style={{ color: theme.textColor }}>
            © 2026 Operadora de Saúde — Portal do Prestador. Todos os direitos reservados.
          </p>
          <p className="font-body text-xs" style={{ color: theme.textColor }}>
            v1.0.0 · Ambiente: Produção · Desenvolvido por Equipe de Tecnologia
          </p>
        </footer>
      </div>

      <ProviderModal
        open={providerModalOpen}
        onClose={() => setProviderModalOpen(false)}
        current={provider}
        onSelect={setProvider}
      />

      <AlertaLoginModal
        open={alertasLogin.length > 0}
        alertas={alertasLogin}
        onFinish={() => setAlertasLogin([])}
      />
    </div>
  );
}
