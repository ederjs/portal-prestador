import React from "react";
import RequisicaoGuiaFormShell from "../components/RequisicaoGuiaFormShell";

interface RequisicaoGuiaInternacaoPageProps {
  onCancel: () => void;
}

/** Formulário da Guia TISS de Internação. Conteúdo a ser implementado a
 *  partir da especificação da guia (pendente de envio). */
export default function RequisicaoGuiaInternacaoPage({ onCancel }: RequisicaoGuiaInternacaoPageProps) {
  return <RequisicaoGuiaFormShell title="Guia Internação" onCancel={onCancel} />;
}
