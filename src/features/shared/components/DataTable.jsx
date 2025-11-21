import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

const DataTable = memo(function DataTable({ 
  columns = [], 
  data = [], 
  loading = false,
  emptyMessage = 'Không có dữ liệu',
  onRowClick 
}) {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  // Memoize row class name to avoid recalculation
  const rowClassName = useMemo(() => 
    `border-b border-slate-100 ${onRowClick ? 'cursor-pointer hover:bg-blue-50' : ''} transition`,
    [onRowClick]
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-slate-200">
            {columns.map((column, index) => (
              <th
                key={column.accessor || index}
                className="px-4 py-3 text-left text-sm font-semibold text-slate-700 bg-slate-50"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <motion.tr
              key={row.id || row._id || rowIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(rowIndex * 0.05, 0.5) }}
              onClick={() => onRowClick && onRowClick(row)}
              className={rowClassName}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={column.accessor || colIndex}
                  className="px-4 py-4 text-sm text-slate-700"
                >
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default DataTable;

