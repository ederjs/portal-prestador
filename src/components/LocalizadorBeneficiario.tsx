import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { C } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
import { BENEFICIARIOS } from "../data/mock";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Button from "./ui/Button";
import type { BeneficiarioBusca } from "../types";

interface LocalizadorBeneficiarioProps {
  open: boolean;
  onClose: () => void;
  /** Devolve o beneficiário selecionado para o campo que chamou o localizador.
   *  `carteiraNome` já vem pronto no padrão "carteirinha - nome" (ex: "1783653875495 -
   *  Ederson da Silva") — esse é o formato padrão para todo campo que usa este localizador;
   *  `nome` e `carteira` continuam disponíveis separados para os casos que precisem deles individualmente. */
  onSelect: (beneficiario: { nome: string; carteira: string; carteiraNome: string }) => void;
}

interface FiltroState {
  cartao: string;
  situacao: string;
  nome: string;
  nomeSocial: string;
  cpf: string;
  dataNascimento: string;
}

const FILTRO_VAZIO: FiltroState = {
  cartao: "",
  situacao: "Todos",
  nome: "",
  nomeSocial: "",
  cpf: "",
  dataNascimento: "",
};

// nomes de teste contendo "ederson" — usados para o mock especial de busca por nome
const NOMES_EDERSON = [
  "Ederson Cardoso Lima",
  "Éderson Souza Martins",
  "Ederson Ferreira Alves",
  "Maria Ederson Santos",
  "José Ederson Nascimento",
  "Ederson Augusto Pereira",
  "Éderson Ribeiro Costa",
  "Ana Ederson Fontoura",
  "Ederson Henrique Barbosa",
  "Ederson Wagner Almeida",
];

// gera um número de carteirinha aleatório com 13 dígitos
function gerarCarteiraAleatoria13(): string {
  let numero = "";
  for (let i = 0; i < 13; i++) numero += Math.floor(Math.random() * 10).toString();
  return numero;
}

// mock especial: buscar por nome "ederson" sempre traz os 10 registros com
// carteirinhas aleatórias de 13 dígitos
function gerarResultadosEderson(): BeneficiarioBusca[] {
  return NOMES_EDERSON.map((nome, i) => ({
    carteira: gerarCarteiraAleatoria13(),
    nome,
    nomeSocial: "",
    cpf: `${String(100 + i).padStart(3, "0")}.${String(200 + i * 3).padStart(3, "0")}.${String(300 + i * 7).padStart(3, "0")}-${String(10 + i).padStart(2, "0")}`,
    dataNascimento: "01/01/1990",
    situacao: "Apto",
  }));
}

/**
 * Modal "Filtro" para localizar um beneficiário — busca por cartão, situação,
 * nome, nome social, CPF e data de nascimento. Após aplicar o filtro, lista
 * os resultados para seleção de 1 registro; ao confirmar em "OK", devolve
 * nome + código da carteirinha para o campo que abriu o localizador (ex:
 * campo "Código da carteira" do Dossiê do Beneficiário).
 */
export default function LocalizadorBeneficiario({ open, onClose, onSelect }: LocalizadorBeneficiarioProps) {
  const { theme } = useTheme();
  const [filtro, setFiltro] = useState<FiltroState>(FILTRO_VAZIO);
  const [resultados, setResultados] = useState<BeneficiarioBusca[] | null>(null);
  const [selecionada, setSelecionada] = useState<string | null>(null);

  if (!open) return null;

  const label = "font-body text-xs mb-1.5 block";

  const set = (campo: keyof FiltroState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFiltro((f) => ({ ...f, [campo]: e.target.value }));

  const handleLimparTodos = () => {
    setFiltro(FILTRO_VAZIO);
    setResultados(null);
    setSelecionada(null);
  };

  const handleAplicar = () => {
    const q = {
      cartao: filtro.cartao.trim().toLowerCase(),
      nome: filtro.nome.trim().toLowerCase(),
      nomeSocial: filtro.nomeSocial.trim().toLowerCase(),
      cpf: filtro.cpf.trim().toLowerCase(),
      dataNascimento: filtro.dataNascimento.trim(),
    };

    // mock de demonstração: busca por nome contendo "ederson" sempre retorna
    // 10 registros com carteirinhas aleatórias de 13 dígitos
    if (q.nome.includes("ederson")) {
      setResultados(gerarResultadosEderson());
      setSelecionada(null);
      return;
    }

    const filtrados = BENEFICIARIOS.filter((b) => {
      if (q.cartao && !b.carteira.toLowerCase().includes(q.cartao)) return false;
      if (q.nome && !b.nome.toLowerCase().includes(q.nome)) return false;
      if (q.nomeSocial && !b.nomeSocial.toLowerCase().includes(q.nomeSocial)) return false;
      if (q.cpf && !b.cpf.toLowerCase().includes(q.cpf)) return false;
      if (q.dataNascimento && b.dataNascimento !== q.dataNascimento) return false;
      if (filtro.situacao !== "Todos" && b.situacao !== filtro.situacao) return false;
      return true;
    });
    setResultados(filtrados);
    setSelecionada(null);
  };

  const handleFechar = () => {
    setFiltro(FILTRO_VAZIO);
    setResultados(null);
    setSelecionada(null);
    onClose();
  };

  const handleOk = () => {
    const escolhido = resultados?.find((b) => b.carteira === selecionada);
    if (!escolhido) return;
    onSelect({
      nome: escolhido.nome,
      carteira: escolhido.carteira,
      carteiraNome: `${escolhido.carteira} - ${escolhido.nome}`,
    });
    handleFechar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "rgba(6,13,26,0.65)" }}
      onClick={handleFechar}
    >
      <div
        className="w-full max-w-4xl mt-6 sm:mt-0 rounded-xl overflow-hidden flex flex-col"
        style={{ backgroundColor: theme.contentCardBg, border: `1px solid ${C.border}`, height: "88vh", maxHeight: "820px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ backgroundColor: C.bronzeSoft }}>
          <h2 className="font-display text-base font-bold" style={{ color: C.bronze }}>
            Filtro
          </h2>
          <button onClick={handleFechar} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.headerControlBg }} aria-label="Fechar">
            <X size={16} style={{ color: theme.textColor }} />
          </button>
        </div>

        <div className="px-5 py-5 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={label} style={{ color: theme.textColor }}>Cartão de identificação</label>
              <Input mono value={filtro.cartao} onChange={set("cartao")} bg={theme.contentCardBg} textColor={theme.textColor} />
            </div>
            <div>
              <label className={label} style={{ color: theme.textColor }}>Situação</label>
              <Select value={filtro.situacao} onChange={set("situacao")} bg={theme.contentCardBg} textColor={theme.textColor} className="w-full">
                <option value="Todos">Todos</option>
                <option value="Apto">Apto</option>
                <option value="Inapto">Inapto</option>
                <option value="Suspenso">Suspenso</option>
              </Select>
            </div>
            <div>
              <label className={label} style={{ color: theme.textColor }}>Nome</label>
              <Input value={filtro.nome} onChange={set("nome")} bg={theme.contentCardBg} textColor={theme.textColor} />
            </div>
            <div>
              <label className={label} style={{ color: theme.textColor }}>Nome social</label>
              <Input value={filtro.nomeSocial} onChange={set("nomeSocial")} bg={theme.contentCardBg} textColor={theme.textColor} />
            </div>
            <div>
              <label className={label} style={{ color: theme.textColor }}>CPF</label>
              <Input mono value={filtro.cpf} onChange={set("cpf")} bg={theme.contentCardBg} textColor={theme.textColor} />
            </div>
            <div>
              <label className={label} style={{ color: theme.textColor }}>Data de nascimento</label>
              <Input type="date" mono value={filtro.dataNascimento} onChange={set("dataNascimento")} bg={theme.contentCardBg} textColor={theme.textColor} />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 shrink-0 flex items-center justify-end gap-2.5" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
          <Button variant="secondary" onClick={handleLimparTodos}>Limpar todos</Button>
          <Button variant="primary" onClick={handleAplicar}>Aplicar</Button>
        </div>

        {/* área de resultados — sempre presente e com altura reservada, para
            a modal não "pular" de tamanho quando a busca retornar registros */}
        <div className="px-5 py-4 flex-1 overflow-y-auto">
          {resultados === null && (
            <p className="font-body text-sm text-center py-10" style={{ color: theme.textColor }}>
              Informe os filtros acima e clique em "Aplicar" para localizar beneficiários.
            </p>
          )}

          {resultados !== null && (
            <>
              <p className="font-body text-xs mb-2" style={{ color: theme.textColor }}>
                {resultados.length} {resultados.length === 1 ? "resultado encontrado" : "resultados encontrados"}
              </p>
              {resultados.length === 0 && (
                <p className="font-body text-sm text-center py-8" style={{ color: theme.textColor }}>
                  Nenhum beneficiário encontrado para os filtros informados.
                </p>
              )}
              <div className="space-y-2">
                {resultados.map((b) => (
                  <button
                    key={b.carteira}
                    onClick={() => setSelecionada(b.carteira)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg text-left transition-colors"
                    style={{
                      backgroundColor: selecionada === b.carteira ? C.bronzeSoft : C.bgPanelAlt,
                      border: `1px solid ${selecionada === b.carteira ? C.bronze : C.borderSoft}`,
                    }}
                  >
                    <div className="min-w-0">
                      <p className="font-body text-sm font-semibold truncate" style={{ color: theme.textColor }}>
                        {b.nome}{b.nomeSocial ? ` (${b.nomeSocial})` : ""}
                      </p>
                      <p className="font-body text-xs mt-0.5" style={{ color: theme.textColor }}>
                        Carteira <span className="font-mono">{b.carteira}</span> · CPF <span className="font-mono">{b.cpf}</span> · Nascimento <span className="font-mono">{b.dataNascimento}</span> · {b.situacao}
                      </p>
                    </div>
                    {selecionada === b.carteira && <Check size={16} className="shrink-0" style={{ color: C.bronze }} />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-3 shrink-0 flex items-center justify-end gap-2.5" style={{ borderTop: `1px solid ${C.borderSoft}` }}>
          <Button variant="secondary" onClick={handleFechar}>Cancelar</Button>
          <Button variant="primary" onClick={handleOk} disabled={!selecionada}>OK</Button>
        </div>
      </div>
    </div>
  );
}
