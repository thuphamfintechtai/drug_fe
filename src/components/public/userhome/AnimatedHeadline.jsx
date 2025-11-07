import React, { useMemo } from "react";
import { motion } from "framer-motion";

export default function AnimatedHeadline({
  text = "Hệ Thống Truy Xuất Nguồn Gốc Thuốc",
  perCharMs = 0.05, // 50ms per character
}) {
  const chars = useMemo(() => Array.from(text), [text]);

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: perCharMs,
      },
    },
  };

  const charVariant = {
    hidden: { opacity: 0, y: 8, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // Time after which the shimmer runs once
  const shimmerDelay = chars.length * perCharMs + 0.3;

  return (
    <div className="relative inline-block">
      <motion.span
        className="block text-center font-bold text-2xl md:text-4xl lg:text-5xl"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {chars.map((c, i) => (
          <motion.span
            key={i}
            variants={charVariant}
            className="inline-block align-baseline bg-clip-text text-transparent bg-gradient-to-br from-cyan-500 to-sky-700"
          >
            {c === " " ? "\u00A0" : c}
          </motion.span>
        ))}
      </motion.span>

      {/* One-time gentle shimmer after reveal */}
      <motion.div
        className="pointer-events-none absolute inset-0 -skew-x-12"
        initial={{ x: "-120%", opacity: 0 }}
        animate={{ x: "120%", opacity: [0, 0.35, 0] }}
        transition={{ delay: shimmerDelay, duration: 1.2, ease: "easeOut" }}
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(186,230,253,0.7) 50%, rgba(255,255,255,0) 100%)",
          mixBlendMode: "screen",
          filter: "blur(4px)",
        }}
      />
    </div>
  );
}
