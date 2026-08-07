import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import GlobalFonts from "../theme/GlobalFonts";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import logoZone from "../assets/logo-zone.svg";

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const { theme } = useTheme();
  const [showPass, setShowPass] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);

  const handleSso = () => {
    setSsoLoading(true);
    // Integração real: redirecionar para o fluxo OIDC do Keycloak, ex:
    // window.location.href = keycloak.createLoginUrl();
    setTimeout(() => {
      setSsoLoading(false);
      onLogin();
    }, 900);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center font-body relative overflow-hidden p-6"
      style={{ backgroundColor: theme.loginBg }}
    >
      <GlobalFonts />

      {/* glow decorativo sutil, sem ocupar uma coluna inteira */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 640,
          height: 640,
          top: "-18%",
          left: "50%",
          transform: "translateX(-50%)",
          background: `radial-gradient(circle, ${C.bronze}14 0%, transparent 70%)`,
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* marca — logo + título em destaque */}
        <div className="flex flex-col items-center text-center mb-8">
          <img src={logoZone} alt="Z-One" className="mb-9" style={{ width: 280, height: "auto" }} />
          <h1 className="font-display text-3xl font-bold" style={{ color: theme.textColor }}>
            Portal do Prestador
          </h1>
          <p className="font-body text-sm mt-2" style={{ color: theme.textColor }}>
            Entre com sua conta para continuar
          </p>
        </div>

        {/* cartão de login — fundo customizável (theme.loginCardBg), texto via theme.textColor */}
        <div className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: theme.loginCardBg, border: `1px solid ${C.borderSoft}`, boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}>
          {/* SSO em destaque — cor customizável (theme.loginButtonBg / loginButtonText) */}
          <Button
            type="button"
            fullWidth
            onClick={handleSso}
            disabled={ssoLoading}
            icon={ssoLoading ? undefined : ShieldCheck}
            bg={theme.loginButtonBg}
            textColor={theme.loginButtonText}
          >
            {ssoLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Redirecionando...
              </>
            ) : (
              "Entrar com SSO corporativo"
            )}
          </Button>

          {/* divisor */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: C.borderSoft }} />
            <span className="font-body text-xs" style={{ color: theme.textColor }}>ou entre com e-mail</span>
            <div className="flex-1 h-px" style={{ backgroundColor: C.borderSoft }} />
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              onLogin();
            }}
          >
            <div>
              <label className="font-body text-xs font-medium block mb-1.5" style={{ color: theme.textColor }}>
                E-mail
              </label>
              <Input
                type="email"
                required
                icon={Mail}
                placeholder="seuemail@hospital.com.br"
                bg={theme.loginCardBg}
                textColor={theme.textColor}
              />
            </div>

            <div>
              <label className="font-body text-xs font-medium block mb-1.5" style={{ color: theme.textColor }}>
                Senha
              </label>
              <div
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg"
                style={{ backgroundColor: theme.loginCardBg, border: `1px solid ${C.border}` }}
              >
                <Lock size={16} style={{ color: theme.textColor }} />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  placeholder="••••••••••"
                  className="font-body bg-transparent outline-none text-sm w-full"
                  style={{ color: theme.textColor }}
                />
                <button type="button" onClick={() => setShowPass((v) => !v)} aria-label="Mostrar senha">
                  {showPass ? (
                    <EyeOff size={16} style={{ color: theme.textColor }} />
                  ) : (
                    <Eye size={16} style={{ color: theme.textColor }} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 font-body text-xs" style={{ color: theme.textColor }}>
                <input type="checkbox" className="rounded" />
                Manter conectado
              </label>
              <a href="#" className="font-body text-xs font-medium" style={{ color: C.bronze }}>
                Esqueci minha senha
              </a>
            </div>

            <Button type="submit" fullWidth className="mt-2">
              Entrar
            </Button>
          </form>
        </div>

        <p className="font-body text-xs text-center mt-6" style={{ color: theme.textColor }}>
          Acesso restrito a usuários cadastrados pela operadora. Em caso de dúvidas, contate o suporte.
        </p>
      </div>
    </div>
  );
}
