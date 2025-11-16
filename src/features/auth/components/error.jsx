import React from "react";
import { motion } from "framer-motion";

export default function ErrorMessage({ error }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl"
    >
      <p className="text-red-700 text-xs sm:text-sm font-medium">{error}</p>
    </motion.div>
  );
}
