/* eslint-disable no-undef */
import { useEffect, useRef, useMemo, memo } from "react";
import { motion } from "framer-motion";

// Lazy load image
const truckSvg = new URL("../../../assets/trunkLoader.png", import.meta.url).href;

const BlockchainTransferView = memo(function BlockchainTransferView({
  status = "minting", // 'minting' | 'completed' | 'error'
  progress = 0, // 0-1: progress từ parent
  onProgressUpdate, // callback để parent có thể update progress
  onClose, // callback để đóng cửa sổ
  transferType = "manufacturer-to-distributor", // 'manufacturer-to-distributor' | 'distributor-to-pharmacy'
}) {
  const mapBarRef = useRef(null);
  const truckRef = useRef(null);
  const currentProgressRef = useRef(0);
  const animationFrameRef = useRef(null);

  // Blockchain blocks configuration - giống BlockchainMintingView
  const totalBlocks = 4;
  const blockSize = 60;
  const spacing = 80;
  const width = (totalBlocks - 1) * spacing + blockSize;
  const height = 90;

  // Tính toán active block dựa trên progress
  const getActiveBlock = () => {
    if (progress <= 0.25) {
      return 0;
    }
    if (progress <= 0.5) {
      return 1;
    }
    if (progress <= 0.75) {
      return 2;
    }
    return 3;
  };

  const activeBlock = getActiveBlock();
  const isCompleted = status === "completed";
  const isError = status === "error";

  // Xác định labels dựa trên transferType
  const isManufacturerToDistributor =
    transferType === "manufacturer-to-distributor";
  const fromLabel = isManufacturerToDistributor
    ? "Manufacturer"
    : "Distributor";
  const toLabel = isManufacturerToDistributor ? "Distributor" : "Pharmacy";

  // Colors
  const cyan = "#00b4d8";
  const lightBlue = "#48cae4";
  const softCyan = "#7EE9F2";

  // Block component - giống BlockchainMintingView
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
        {/* Checkmark on completed */}
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

  // LinkLine component - giống BlockchainMintingView
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
        isCompleted: isCompleted && i <= activeBlock,
      })),
    [activeBlock, status, isCompleted]
  );

  // Smooth interpolation - xe tải sẽ "đuổi" theo target position mượt mà
  useEffect(() => {
    const updateTruckPosition = () => {
      if (mapBarRef.current && truckRef.current) {
        const width = mapBarRef.current.clientWidth;
        const pad = 18;
        const truckWidth = 90;
        const targetProgress = Math.min(Math.max(progress, 0), 1);

        // Smooth interpolation - mượt mà hơn
        const currentProgress = currentProgressRef.current;
        const diff = targetProgress - currentProgress;

        // Sử dụng ease-out để mượt mà hơn
        const speed = 0.08; // Điều chỉnh tốc độ "đuổi theo" (0.05-0.15)
        const newProgress = currentProgress + diff * speed;

        // Cập nhật progress hiện tại
        currentProgressRef.current =
          Math.abs(diff) < 0.001 ? targetProgress : newProgress;

        // Tính toán vị trí
        const p = currentProgressRef.current;
        const left = pad + (width - truckWidth - pad * 2) * p;

        // Sử dụng transform thay vì left để tối ưu performance (GPU-accelerated)
        if (truckRef.current) {
          truckRef.current.style.transform = `translateX(${left}px)`;
        }
      }

      // Tiếp tục animation loop
      animationFrameRef.current = requestAnimationFrame(updateTruckPosition);
    };

    // Bắt đầu animation loop
    animationFrameRef.current = requestAnimationFrame(updateTruckPosition);

    // Update on window resize
    const handleResize = () => {
      if (mapBarRef.current && truckRef.current) {
        const width = mapBarRef.current.clientWidth;
        const pad = 18;
        const truckWidth = 90;
        const p = currentProgressRef.current;
        const left = pad + (width - truckWidth - pad * 2) * p;
        truckRef.current.style.transform = `translateX(${left}px)`;
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [progress]);

  return (
    <>
      <style>{`
        .transfer-card {
          width: min(980px, 96vw);
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .transfer-card__head {
          padding: 28px 32px;
          color: #fff;
          background: linear-gradient(135deg, #077ca3 0%, #077ca3 100%);
          position: relative;
          box-shadow: 0 4px 12px rgba(0, 180, 216, 0.2);
        }

        .transfer-card__title {
          font-weight: 700;
          font-size: 24px;
          letter-spacing: -0.02em;
          line-height: 1.3;
        }

        .transfer-card__sub {
          opacity: 0.95;
          margin-top: 6px;
          font-size: 15px;
          font-weight: 400;
          line-height: 1.5;
        }

        .transfer-card__close {
          position: absolute;
          top: 24px;
          right: 32px;
          width: 36px;
          height: 36px;
          border: none;
          background: rgba(255, 255, 255, 0.25);
          color: #fff;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
          transition: all 0.25s ease;
          backdrop-filter: blur(4px);
        }

        .transfer-card__close:hover {
          background: rgba(255, 255, 255, 0.35);
          transform: scale(1.1) rotate(90deg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .transfer-card__close:active {
          transform: scale(0.95) rotate(90deg);
        }

        .transfer-card__body {
          padding: 36px 32px 32px;
        }

        .status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .status__spinner {
          width: 72px;
          height: 72px;
          border: 6px solid #e6f7ff;
          border-top-color: #00b4d8;
          border-radius: 50%;
          animation: spin 1.1s linear infinite;
          box-shadow: 0 4px 12px rgba(0, 180, 216, 0.15);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .status__text {
          font-weight: 700;
          font-size: 22px;
          text-align: center;
          background: linear-gradient(135deg, #077ca3 0%, #077ca3 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: -0.01em;
          line-height: 1.4;
        }

        .status__hint {
          opacity: 0.75;
          font-size: 14px;
          text-align: center;
          color: #64748b;
          line-height: 1.5;
          max-width: 480px;
        }

        .transfer-card.success .status__spinner {
          display: none;
        }

        .transfer-card.success .status__text {
          background: none;
          color: #077ca3;
          font-size: 24px;
        }

        .transfer-card.error .status__spinner {
          display: none;
        }

        .transfer-card.error .status__text {
          background: none;
          color: #ef4444;
          font-size: 24px;
        }

        /* MAP */
        .map {
          margin: 75px auto 20px;
          width: clamp(280px, 86%, 860px);
        }

        .map__bar {
          position: relative;
          height: 16px;
          border-radius: 999px;
          background: linear-gradient(90deg, #eaf7ff 0%, #f0f9ff 100%);
          box-shadow: inset 0 2px 4px rgba(0, 180, 216, 0.1), inset 0 0 0 2px rgba(0, 180, 216, 0.12);
        }

        .node {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid #bfefff;
          box-shadow: 0 0 0 3px #e9fbff, 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .node--left {
          left: -8px;
        }

        .node--right {
          right: -8px;
        }

        .node__label {
          position: absolute;
          top: -65px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          color: #1e293b;
          letter-spacing: -0.01em;
        }

        .node--active {
          border-color: #7EE9F2;
          box-shadow: 0 0 0 4px rgba(0, 180, 216, 0.25), 0 0 20px rgba(72, 202, 228, 0.7), 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-50%) scale(1.1);
        }

        .node--success {
          border-color: #22c55e;
          background: #f0fdf4;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2), 0 0 24px rgba(34, 197, 94, 0.6), 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-50%) scale(1.1);
        }

        .node--error {
          border-color: #ef4444;
          background: #fef2f2;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2), 0 0 24px rgba(239, 68, 68, 0.6), 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-50%) scale(1.1);
        }

        /* TRUCK */
        .truck {
          position: absolute;
          top: -45px;
          left: 0;
          width: 95px;
          height: auto;
          transform: translateX(0);
          filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.2)) drop-shadow(0 2px 4px rgba(0, 180, 216, 0.3));
          will-change: transform;
          transition: transform 0.1s linear;
        }

        /* Blockchain strip */
        .chain {
          margin: 28px auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 0;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          padding: 14px 24px 22px;
          border-top: 1px solid #eef2f7;
        }
      `}</style>

      <main
        className={`transfer-card ${isCompleted ? "success" : ""} ${
          isError ? "error" : ""
        }`}
      >
        <header className="transfer-card__head">
          <div className="transfer-card__title">Chờ chuyển giao NFT</div>
          <div className="transfer-card__sub">
            {isError
              ? "Giao dịch blockchain thất bại"
              : isCompleted
              ? `NFT đã đến ${toLabel} & được xác nhận trên blockchain`
              : "Đang vận chuyển NFT và xác minh trên blockchain..."}
          </div>
          {isError && onClose && (
            <button
              className="transfer-card__close"
              onClick={onClose}
              aria-label="Đóng"
            >
              ✕
            </button>
          )}
        </header>

        <section className="transfer-card__body">
          <div className="status">
            <div className="status__spinner"></div>
            <div className="status__text">
              {isError
                ? "Chuyển giao thất bại"
                : isCompleted
                ? "Chuyển giao thành công"
                : "Đang chuyển giao & xác minh..."}
            </div>
            <div className="status__hint">
              {isError
                ? "Vui lòng kiểm tra lại và thử lại sau."
                : isCompleted
                ? "Bạn có thể tiếp tục bước tiếp theo."
                : "Vui lòng chờ giao dịch blockchain được xác nhận."}
            </div>
          </div>

          {/* MAP */}
          <div className="map">
            <div className="map__bar" ref={mapBarRef}>
              <div
                className={`node node--left ${
                  status === "minting" || isCompleted || isError
                    ? "node--active"
                    : ""
                }`}
              >
                <span className="node__label">{fromLabel}</span>
              </div>

              {/* SVG truck */}
              <img
                ref={truckRef}
                src={truckSvg}
                className="truck"
                alt="truck"
              />

              <div
                className={`node node--right ${
                  isError
                    ? "node--error node--active"
                    : isCompleted
                    ? "node--success node--active"
                    : ""
                }`}
              >
                <span className="node__label">{toLabel}</span>
              </div>
            </div>
          </div>

          {/* CHAIN - giống BlockchainMintingView */}
          <div className="chain">
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              className="overflow-visible"
            >
              {/* ====== SVG defs (gradients) ====== */}
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
            </svg>
          </div>
        </section>
      </main>
    </>
  );
});

export default BlockchainTransferView;
