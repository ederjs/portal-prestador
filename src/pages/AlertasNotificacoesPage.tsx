import React, { useState } from "react";
import { Plus, Megaphone, X, Pencil, Trash2, Check } from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import { ALERTAS, adicionarAlerta, atualizarAlerta, removerAlerta } from "../data/mock";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import DataTable, { type Column } from "../components/ui/DataTable";
import type { Alerta } from "../types";

// converte "yyyy-mm-dd" (valor nativo do <input type="date">) para "dd/mm/aaaa"
function formatarDataBr(iso: string): string {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

interface FormAlerta {
  titulo: string;
  descricao: string;
  dataInicioVigencia: string;
  dataFimVigencia: string;
  ativo: "Ativo" | "Inativo";
}

const FORM_VAZIO: FormAlerta = {
  titulo: "",
  descricao: "",
  dataInicioVigencia: "",
  dataFimVigencia: "",
  ativo: "Ativo",
};

/**
 * Página "Alertas e notificações" (menu Configurações). Lista os alertas já
 * cadastrados e permite criar um novo — os registros ativos e dentro do
 * período de vigência são exibidos automaticamente em modal no login
 * (ver AlertaLoginModal, disparado a partir de App.tsx).
 */
export default function AlertasNotificacoesPage() {
  const { theme } = useTheme();
  // cópia independente do array mutável ALERTAS — evita duplicar itens ao
  // prependar um novo alerta (ALERTAS já é mutado via push em adicionarAlerta)
  const [alertas, setAlertas] = useState<Alerta[]>(() => [...ALERTAS]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState<FormAlerta>(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState<number | null>(null);

  const cardStyle = { backgroundColor: theme.contentCardBg, border: `1px solid ${C.borderSoft}` };
  const label = "font-body text-xs font-medium block mb-1.5";
  const labelStyle: React.CSSProperties = { color: theme.textColor };
  const fieldProps = { bg: theme.contentCardBg, textColor: theme.textColor };

  const set = (campo: keyof FormAlerta) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  const formValido =
    form.titulo.trim() && form.descricao.trim() && form.dataInicioVigencia && form.dataFimVigencia;

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValido) return;
    const dados = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      dataInicioVigencia: form.dataInicioVigencia,
      dataFimVigencia: form.dataFimVigencia,
      ativo: form.ativo === "Ativo",
    };

    if (editandoId !== null) {
      const atualizado = atualizarAlerta(editandoId, dados);
      if (atualizado) {
        setAlertas((prev) => prev.map((a) => (a.id === editandoId ? atualizado : a)));
      }
    } else {
      const novo = adicionarAlerta(dados);
      setAlertas((prev) => [novo, ...prev]);
    }

    setForm(FORM_VAZIO);
    setEditandoId(null);
    setMostrarForm(false);
  };

  const handleNovoAlerta = () => {
    setForm(FORM_VAZIO);
    setEditandoId(null);
    setMostrarForm(true);
  };

  const handleEditar = (a: Alerta) => {
    setForm({
      titulo: a.titulo,
      descricao: a.descricao,
      dataInicioVigencia: a.dataInicioVigencia,
      dataFimVigencia: a.dataFimVigencia,
      ativo: a.ativo ? "Ativo" : "Inativo",
    });
    setEditandoId(a.id);
    setConfirmarExclusaoId(null);
    setMostrarForm(true);
  };

  const handleCancelarForm = () => {
    setMostrarForm(false);
    setForm(FORM_VAZIO);
    setEditandoId(null);
  };

  const handleExcluir = (id: number) => {
    removerAlerta(id);
    setAlertas((prev) => prev.filter((a) => a.id !== id));
    setConfirmarExclusaoId(null);
    if (editandoId === id) handleCancelarForm();
  };

  const columns: Column<Alerta>[] = [
    {
      key: "titulo",
      header: "Título",
      render: (a) => (
        <div className="max-w-xs">
          <p className="font-body text-sm font-medium" style={{ color: theme.textColor }}>{a.titulo}</p>
          <p className="font-body text-xs mt-0.5 truncate" style={{ color: theme.textColor }}>{a.descricao}</p>
        </div>
      ),
    },
    {
      key: "vigencia",
      header: "Vigência",
      render: (a) => (
        <span className="font-mono text-xs" style={{ color: theme.textColor }}>
          {formatarDataBr(a.dataInicioVigencia)} até {formatarDataBr(a.dataFimVigencia)}
        </span>
      ),
    },
    {
      key: "ativo",
      header: "Status",
      render: (a) => (
        <span
          className="font-body inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ color: a.ativo ? C.teal : C.textFaint, backgroundColor: a.ativo ? C.tealSoft : C.bgPanelAlt }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.ativo ? C.teal : C.textFaint }} />
          {a.ativo ? "Ativo" : "Inativo"}
        </span>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      render: (a) =>
        confirmarExclusaoId === a.id ? (
          <div className="flex items-center gap-2">
            <span className="font-body text-xs" style={{ color: theme.textColor }}>Excluir?</span>
            <button
              onClick={() => handleExcluir(a.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: C.coralSoft }}
              aria-label="Confirmar exclusão"
            >
              <Check size={14} style={{ color: C.coral }} />
            </button>
            <button
              onClick={() => setConfirmarExclusaoId(null)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: theme.headerControlBg }}
              aria-label="Cancelar exclusão"
            >
              <X size={14} style={{ color: theme.textColor }} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEditar(a)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: theme.headerControlBg }}
              aria-label={`Editar ${a.titulo}`}
            >
              <Pencil size={13} style={{ color: theme.textColor }} />
            </button>
            <button
              onClick={() => setConfirmarExclusaoId(a.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: theme.headerControlBg }}
              aria-label={`Excluir ${a.titulo}`}
            >
              <Trash2 size={13} style={{ color: C.coral }} />
            </button>
          </div>
        ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-xl font-bold" style={{ color: theme.textColor }}>
            Alertas e notificações
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: theme.textColor }}>
            Alertas ativos e dentro da vigência aparecem automaticamente para o usuário ao fazer login
          </p>
        </div>
        {!mostrarForm && (
          <Button icon={Plus} onClick={handleNovoAlerta}>
            Novo alerta
          </Button>
        )}
      </div>

      {mostrarForm && (
        <form onSubmit={handleSalvar} className="rounded-xl p-4 sm:p-5 mb-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone size={16} style={{ color: C.bronze }} />
              <h2 className="font-display text-sm font-bold" style={{ color: theme.textColor }}>
                {editandoId !== null ? "Editar alerta" : "Novo alerta"}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleCancelarForm}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: theme.headerControlBg }}
              aria-label="Cancelar"
            >
              <X size={16} style={{ color: theme.textColor }} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={label} style={labelStyle}>Título</label>
              <Input required value={form.titulo} onChange={set("titulo")} placeholder="Ex: Manutenção programada do sistema" {...fieldProps} />
            </div>

            <div>
              <label className={label} style={labelStyle}>Descrição</label>
              <Textarea
                required
                rows={6}
                value={form.descricao}
                onChange={set("descricao")}
                placeholder="Descreva o conteúdo completo do alerta..."
                {...fieldProps}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={label} style={labelStyle}>Data início de vigência</label>
                <Input required type="date" mono value={form.dataInicioVigencia} onChange={set("dataInicioVigencia")} {...fieldProps} />
              </div>
              <div>
                <label className={label} style={labelStyle}>Data final de vigência</label>
                <Input required type="date" mono value={form.dataFimVigencia} onChange={set("dataFimVigencia")} {...fieldProps} />
              </div>
              <div>
                <label className={label} style={labelStyle}>Situação</label>
                <Select value={form.ativo} onChange={set("ativo")} className="w-full" {...fieldProps}>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 mt-5">
            <Button type="button" variant="secondary" onClick={handleCancelarForm}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formValido}>
              {editandoId !== null ? "Salvar alterações" : "Salvar alerta"}
            </Button>
          </div>
        </form>
      )}

      <DataTable
        columns={columns}
        data={alertas}
        getRowKey={(a) => a.id}
        emptyMessage="Nenhum alerta cadastrado."
        renderMobileCard={(a) => (
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="font-body text-sm font-semibold" style={{ color: theme.textColor }}>{a.titulo}</p>
              <span
                className="font-body inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0"
                style={{ color: a.ativo ? C.teal : C.textFaint, backgroundColor: a.ativo ? C.tealSoft : C.bgPanelAlt }}
              >
                {a.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
            <p className="font-body text-xs mt-1 truncate" style={{ color: theme.textColor }}>{a.descricao}</p>
            <p className="font-mono text-[11px] mt-1" style={{ color: theme.textColor }}>
              {formatarDataBr(a.dataInicioVigencia)} até {formatarDataBr(a.dataFimVigencia)}
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              {confirmarExclusaoId === a.id ? (
                <>
                  <span className="font-body text-xs" style={{ color: theme.textColor }}>Excluir este alerta?</span>
                  <button onClick={() => handleExcluir(a.id)} className="px-2.5 py-1 rounded-lg font-body text-xs font-medium" style={{ backgroundColor: C.coralSoft, color: C.coral }}>
                    Confirmar
                  </button>
                  <button onClick={() => setConfirmarExclusaoId(null)} className="px-2.5 py-1 rounded-lg font-body text-xs font-medium" style={{ backgroundColor: theme.headerControlBg, color: theme.textColor }}>
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEditar(a)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-body text-xs font-medium" style={{ backgroundColor: theme.headerControlBg, color: theme.textColor }}>
                    <Pencil size={12} /> Editar
                  </button>
                  <button onClick={() => setConfirmarExclusaoId(a.id)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-body text-xs font-medium" style={{ backgroundColor: theme.headerControlBg, color: C.coral }}>
                    <Trash2 size={12} /> Excluir
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      />
    </div>
  );
}
