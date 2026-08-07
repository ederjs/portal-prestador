import React from "react";
import RequisicaoGuiaFormShell from "../components/RequisicaoGuiaFormShell";

interface RequisicaoGuiaProrrogacaoIntPageProps {
  onCancel: () => void;
}

/** Formulário da Guia TISS de Prorrogação de Internação. Conteúdo a ser
 *  implementado a partir da especificação da guia (pendente de envio). */
export default function RequisicaoGuiaProrrogacaoIntPage({ onCancel }: RequisicaoGuiaProrrogacaoIntPageProps) {
  return <RequisicaoGuiaFormShell title="Guia Prorrogação Internação" onCancel={onCancel} />;
}
