import React from "react";
import RequisicaoGuiaFormShell from "../components/RequisicaoGuiaFormShell";

interface RequisicaoGuiaSAPSADTPageProps {
  onCancel: () => void;
}

/** Formulário da Guia TISS de SP/SADT. Conteúdo a ser implementado a
 *  partir da especificação da guia (pendente de envio). */
export default function RequisicaoGuiaSAPSADTPage({ onCancel }: RequisicaoGuiaSAPSADTPageProps) {
  return <RequisicaoGuiaFormShell title="Guia SP/SADT" onCancel={onCancel} />;
}
