import React from "react";
import RequisicaoGuiaFormShell from "../components/RequisicaoGuiaFormShell";

interface RequisicaoGuiaOdontologicoPageProps {
  onCancel: () => void;
}

/** Formulário da Guia TISS de Tratamento Odontológico. Conteúdo a ser
 *  implementado a partir da especificação da guia (pendente de envio). */
export default function RequisicaoGuiaOdontologicoPage({ onCancel }: RequisicaoGuiaOdontologicoPageProps) {
  return <RequisicaoGuiaFormShell title="Guia Tratamento Odontológico" onCancel={onCancel} />;
}
