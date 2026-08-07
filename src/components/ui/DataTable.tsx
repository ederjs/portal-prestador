import React, { type ReactNode } from "react";
import { C } from "../../theme/colors";
import { useTheme } from "../../theme/ThemeContext";

export interface Column<T> {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  mono?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  renderMobileCard?: (row: T) => ReactNode;
  getRowKey?: (row: T) => string | number;
  emptyMessage?: string;
}

/**
 * Tabela genérica do design system (com generics de TypeScript — funciona
 * tipada para qualquer formato de dado, ex: DataTable<GuiaSolicitada>).
 *
 * O fundo do cartão vem de theme.contentCardBg; a cor de fonte (cabeçalho
 * e conteúdo) vem do campo único theme.textColor.
 *
 * - `columns`: [{ key, header, render(row), mono?: bool }]
 * - `data`: array de objetos (cada um precisa de um id único, ou passe `getRowKey`)
 * - `renderMobileCard(row)`: como cada linha aparece em telas pequenas (abaixo de `sm`)
 *   Se omitido, cai numa versão simplificada usando a 1ª e 2ª coluna.
 * - `emptyMessage`: texto exibido quando `data` está vazio
 */
export default function DataTable<T>({
  columns,
  data,
  renderMobileCard,
  getRowKey = (row: any) => row.id,
  emptyMessage = "Nenhum registro encontrado.",
}: DataTableProps<T>) {
  const { theme } = useTheme();

  return (
    <>
      {/* TABELA — telas sm e acima */}
      <div className="hidden sm:block rounded-xl overflow-hidden" style={{ backgroundColor: theme.contentCardBg, border: `1px solid ${C.borderSoft}` }}>
        <table className="w-full">
          <thead>
            <tr className="font-body text-[11px] uppercase tracking-wide" style={{ color: theme.textColor }}>
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-2">
                  {col.header}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={getRowKey(row)} style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-2 font-body text-sm ${col.mono ? "font-mono text-xs" : ""}`}
                    style={{ color: theme.textColor }}
                  >
                    {col.render ? col.render(row) : String((row as any)[col.key])}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center font-body text-sm" style={{ color: theme.textColor }}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CARDS — telas abaixo de sm (mobile) */}
      <div className="sm:hidden space-y-2">
        {data.map((row) => (
          <div
            key={getRowKey(row)}
            className="px-4 py-2.5 rounded-xl"
            style={{ backgroundColor: theme.contentCardBg, border: `1px solid ${C.borderSoft}` }}
          >
            {renderMobileCard ? renderMobileCard(row) : (
              <div className="flex items-center justify-between">
                <span className="font-body text-sm" style={{ color: theme.textColor }}>
                  {columns[0]?.render ? columns[0].render(row) : String((row as any)[columns[0]?.key])}
                </span>
                <span className="font-mono text-xs" style={{ color: theme.textColor }}>
                  {columns[1]?.render ? columns[1].render(row) : String((row as any)[columns[1]?.key])}
                </span>
              </div>
            )}
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-center font-body text-sm py-10" style={{ color: theme.textColor }}>
            {emptyMessage}
          </p>
        )}
      </div>
    </>
  );
}
