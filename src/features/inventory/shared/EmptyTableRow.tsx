interface EmptyTableRowProps {
  colSpan: number;
  message: string;
}

export function EmptyTableRow({ colSpan, message }: EmptyTableRowProps) {
  return (
    <tr>
      <td className="py-10 text-center text-slate-500" colSpan={colSpan}>
        {message}
      </td>
    </tr>
  );
}
