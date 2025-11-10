import { motion } from "framer-motion";

export default function EmptyState({
  icon = "📭",
  title = "Không có dữ liệu",
  description = "Chưa có thông tin để hiển thị",
  action,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      <div className="text-7xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6 max-w-md">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 !text-white font-semibold rounded-xl hover:shadow-lg transition transform hover:scale-105"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
