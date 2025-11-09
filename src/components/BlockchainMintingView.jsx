import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";

/**
 * BlockchainMintingView
 * Props:
 *  - status: 'minting' | 'completed'
 *  - onComplete?: () => void
 */
export default function BlockchainMintingView({
  status = "minting",
  onComplete,
}) {
  const totalBlocks = 5;
  const blockSize = 60;
  const spacing = 80;
  const width = (totalBlocks - 1) * spacing + blockSize;
  const height = 90;

  const [activeBlock, setActiveBlock] = useState(0);
  const [burst, setBurst] = useState(false);

  // Loop active highlight when minting
  useEffect(() => {
    let interval;
    if (status === "minting") {
      setBurst(false);
      interval = setInterval(() => {
        setActiveBlock((prev) => (prev < totalBlocks - 1 ? prev + 1 : 0));
      }, 800);
    } else {
      // Completed: lock active at last and trigger burst
      setActiveBlock(totalBlocks - 1);
      setBurst(true);
      const t = setTimeout(() => setBurst(false), 600);
      return () => clearTimeout(t);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Helpers
  const isCompleted = status === "completed";
  const cyan = "#00b4d8";
  const lightBlue = "#48cae4";
  const softCyan = "#7EE9F2";

  /* ====== Subcomponents ====== */
  const Block = ({ index, isActive, isCompleted }) => {
    const x = index * spacing;
    return (
      <g>
        {/* Outer rect with gradient + animated gradient movement */}
        <motion.rect
          x={x}
          y={0}
          width={blockSize}
          height={blockSize}
          rx="10"
          stroke={isCompleted || isActive ? cyan : "#c4e8f0"}
          strokeWidth={isCompleted || isActive ? 3 : 2}
          fill={`url(#blockGradient-${index})`}
          style={{
            filter:
              isActive || isCompleted
                ? "drop-shadow(0 0 10px rgba(126,233,242,0.8))"
                : "none",
          }}
          initial={{ opacity: 0.85, scale: 1 }}
          animate={{
            opacity: isActive || isCompleted ? 1 : 0.85,
            scale: isActive ? 1.05 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
        {/* Inner decorative lines */}
        <line
          x1={x + 10}
          y1={blockSize / 2}
          x2={x + blockSize - 10}
          y2={blockSize / 2}
          stroke={isActive || isCompleted ? cyan : "#b8e1f0"}
          strokeWidth="1.5"
          opacity={0.5}
        />
        <line
          x1={x + 14}
          y1={blockSize / 2 - 8}
          x2={x + blockSize - 14}
          y2={blockSize / 2 - 8}
          stroke={isActive || isCompleted ? cyan : "#b8e1f0"}
          strokeWidth="1"
          opacity={0.35}
        />
        <line
          x1={x + 14}
          y1={blockSize / 2 + 8}
          x2={x + blockSize - 14}
          y2={blockSize / 2 + 8}
          stroke={isActive || isCompleted ? cyan : "#b8e1f0"}
          strokeWidth="1"
          opacity={0.35}
        />
        {/* Checkmark on completed (draw path animation) */}
        {isCompleted && (
          <motion.path
            d={`M ${x + 16} ${blockSize / 2} L ${x + blockSize / 2 - 5} ${
              blockSize / 2 + 10
            } L ${x + blockSize - 16} ${blockSize / 2 - 10}`}
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.55, delay: index * 0.05 }}
          />
        )}
      </g>
    );
  };

  const LinkLine = ({ i, active, completed }) => {
    const startX = i * spacing + blockSize;
    const endX = (i + 1) * spacing;
    const y = blockSize / 2;

    return (
      <g>
        {/* Base line */}
        <line
          x1={startX}
          y1={y}
          x2={endX}
          y2={y}
          stroke="#c4e8f0"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Cyan lit line when completed */}
        {completed && (
          <motion.line
            x1={startX}
            y1={y}
            x2={endX}
            y2={y}
            stroke={softCyan}
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          />
        )}
        {/* Glow dot traveling when minting */}
        {!completed && (
          <g>
            <motion.line
              x1={startX}
              y1={y}
              x2={endX}
              y2={y}
              stroke="url(#lineGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: active ? 1 : 0.2 }}
              transition={{ duration: 0.3 }}
            />
            {active && (
              <circle cx={startX} cy={y} r="6" fill={softCyan} opacity="0.9">
                <animateMotion
                  dur="0.8s"
                  repeatCount="indefinite"
                  path={`M ${startX} ${y} L ${endX} ${y}`}
                  calcMode="linear"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="0.8s"
                  repeatCount="indefinite"
                  keyTimes="0;0.25;0.75;1"
                />
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  values="1;1.25;1"
                  dur="0.8s"
                  repeatCount="indefinite"
                  keyTimes="0;0.5;1"
                />
              </circle>
            )}
          </g>
        )}
      </g>
    );
  };

  // Precompute block booleans
  const booleans = useMemo(
    () =>
      Array.from({ length: totalBlocks }).map((_, i) => ({
        isActive: status === "minting" && activeBlock === i,
        isCompleted,
      })),
    [activeBlock, status, isCompleted]
  );

  return (
    <div className="relative w-full">
      {/* Soft cyan glow layer behind */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[70%] h-40 bg-[#7EE9F255] blur-2xl rounded-full animate-pulse" />
      </div>

      {/* Container */}
      <div className="relative mx-auto max-w-3xl rounded-3xl backdrop-blur-md shadow-xl bg-linear-to-br from-secondary to-primary p-[1px]">
        <div className="rounded-3xl bg-white/90">
          {/* Header */}
          <div className="rounded-t-3xl px-8 pt-8">
            <h2 className="text-center text-2xl font-extrabold !text-white drop-shadow-sm">
              <span className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-secondary to-primary px-5 py-2">
                {status === "minting"
                  ? "Chuyển giao NFT"
                  : "Sản xuất & Mint NFT"}
              </span>
            </h2>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Spinner */}
            <div className="mb-10">
              {status === "minting" ? (
                <motion.div
                  className="mx-auto h-20 w-20 rounded-full border-4 border-[#00b4d8] border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <motion.div
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-secondary to-primary"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  onAnimationComplete={() => onComplete?.()}
                >
                  <svg
                    className="h-12 w-12 !text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6 }}
                    />
                  </svg>
                </motion.div>
              )}
            </div>

            {/* Blockchain Visualization */}
            <div className="mb-10 flex justify-center">
              <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="overflow-visible"
              >
                {/* ====== SVG defs (gradients + burst) ====== */}
                <defs>
                  {/* Line gradient */}
                  <linearGradient
                    id="lineGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor={cyan} stopOpacity="0.2">
                      <animate
                        attributeName="offset"
                        values="0;0.5;1"
                        dur="1.2s"
                        repeatCount="indefinite"
                      />
                    </stop>
                    <stop offset="50%" stopColor={softCyan} stopOpacity="1">
                      <animate
                        attributeName="offset"
                        values="0;0.5;1"
                        dur="1.2s"
                        repeatCount="indefinite"
                      />
                    </stop>
                    <stop offset="100%" stopColor={cyan} stopOpacity="0.2">
                      <animate
                        attributeName="offset"
                        values="0;0.5;1"
                        dur="1.2s"
                        repeatCount="indefinite"
                      />
                    </stop>
                  </linearGradient>

                  {/* Moving gradient for each block */}
                  {Array.from({ length: totalBlocks }).map((_, i) => (
                    <linearGradient
                      key={`bg-${i}`}
                      id={`blockGradient-${i}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor={cyan} stopOpacity="0.85" />
                      <stop offset="50%" stopColor={softCyan} stopOpacity="1" />
                      <stop
                        offset="100%"
                        stopColor={lightBlue}
                        stopOpacity="0.9"
                      />
                      {/* Animate gradient sliding horizontally */}
                      <animate
                        attributeName="gradientTransform"
                        type="translate"
                        values="0 0; 20 0; 0 0"
                        dur="2.2s"
                        repeatCount="indefinite"
                      />
                    </linearGradient>
                  ))}

                  {/* Radial gradient for completion burst */}
                  <radialGradient id="burstGradient">
                    <stop offset="0%" stopColor={softCyan} stopOpacity="0.95" />
                    <stop offset="60%" stopColor={cyan} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={cyan} stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Connection lines (N-1) */}
                {Array.from({ length: totalBlocks - 1 }).map((_, i) => (
                  <LinkLine
                    key={`line-${i}`}
                    i={i}
                    active={status === "minting" && activeBlock === i}
                    completed={isCompleted}
                  />
                ))}

                {/* Blocks */}
                {booleans.map(({ isActive, isCompleted }, i) => (
                  <Block
                    key={`b-${i}`}
                    index={i}
                    isActive={isActive}
                    isCompleted={isCompleted}
                  />
                ))}

                {/* Completion burst overlay */}
                <AnimatePresence>
                  {burst && (
                    <motion.circle
                      key="burst"
                      cx={width / 2}
                      cy={blockSize / 2}
                      r={1}
                      fill="url(#burstGradient)"
                      initial={{ r: 0, opacity: 0.9 }}
                      animate={{ r: width, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  )}
                </AnimatePresence>
              </svg>
            </div>

            {/* Text Status */}
            <div className="space-y-2 text-center">
              {status === "minting" ? (
                <>
                  <h3 className="text-2xl font-extrabold">
                    <span className="bg-linear-to-r from-secondary to-primary bg-[length:200%_100%] bg-clip-text text-transparent [animation:shimmer_2.2s_linear_infinite]">
                      Đang chuyển giao NFT...
                    </span>
                  </h3>
                  <motion.p
                    className="text-sm text-slate-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    Vui lòng chờ giao dịch blockchain hoàn tất.
                  </motion.p>
                </>
              ) : (
                <>
                  <motion.h3
                    className="text-2xl font-extrabold text-emerald-600"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35 }}
                  >
                    ✅ Chuyển giao thành công!
                  </motion.h3>
                  <motion.p
                    className="text-sm text-slate-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35, delay: 0.1 }}
                  >
                    NFT đã được chuyển giao thành công trên blockchain.
                  </motion.p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Local styles for shimmer */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
}
