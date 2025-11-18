import { motion } from 'framer-motion';

export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-red-50 border-2 border-red-200 rounded-xl mb-4"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">❌</span>
        <div className="flex-1">
          <p className="text-red-700 font-medium">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold underline"
            >
              Thử lại
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

