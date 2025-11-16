import { motion } from 'framer-motion';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

export default function DataTable({ 
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-slate-200">
            {columns.map((column, index) => (
              <th
                key={index}
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
              key={rowIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIndex * 0.05 }}
              onClick={() => onRowClick && onRowClick(row)}
              className={`border-b border-slate-100 ${
                onRowClick ? 'cursor-pointer hover:bg-blue-50' : ''
              } transition`}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
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
}

