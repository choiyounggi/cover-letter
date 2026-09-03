import type { ReactNode } from "react";

export function EntityTable<T extends { id: string }>({
  columns,
  rows,
  renderActions,
}: {
  columns: { key: keyof T & string; header: string }[];
  rows: T[];
  renderActions?: (row: T) => ReactNode;
}) {
  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-border text-fg-muted">
          {columns.map((c) => (
            <th key={c.key} className="px-3 py-2 font-medium">
              {c.header}
            </th>
          ))}
          {renderActions ? <th className="px-3 py-2" /> : null}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-border last:border-0">
            {columns.map((c) => (
              <td key={c.key} className="px-3 py-2 text-fg">
                {String(row[c.key] ?? "")}
              </td>
            ))}
            {renderActions ? <td className="px-3 py-2">{renderActions(row)}</td> : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
