import { useEffect, useRef, useState } from 'react';
import truckSvg from '../assets/truck.svg';

export default function BlockchainTransferView({ 
  status = 'minting', // 'minting' | 'completed' | 'error'
  progress = 0, // 0-1: progress từ parent
  onProgressUpdate // callback để parent có thể update progress
}) {
  const mapBarRef = useRef(null);
  const truckRef = useRef(null);
  const currentProgressRef = useRef(0);
  const animationFrameRef = useRef(null);
  
  // Tính toán số blocks đã sáng dựa trên progress
  const getLitBlocks = () => {
    if (progress <= 0.2) return [];
    if (progress <= 0.4) return [0];
    if (progress <= 0.6) return [0, 1];
    if (progress <= 0.8) return [0, 1, 2];
    return [0, 1, 2, 3];
  };

  const litBlocks = getLitBlocks();
  const isCompleted = status === 'completed';
  const isError = status === 'error';

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
        currentProgressRef.current = Math.abs(diff) < 0.001 ? targetProgress : newProgress;
        
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

    window.addEventListener('resize', handleResize);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [progress]);

  return (
    <>
      <style>{`
        .transfer-card {
          width: min(980px, 96vw);
          background: #fff;
          border-radius: 22px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .transfer-card__head {
          padding: 20px 24px;
          color: #fff;
          background: linear-gradient(90deg, #00b4d8, #48cae4);
        }

        .transfer-card__title {
          font-weight: 700;
          font-size: 22px;
        }

        .transfer-card__sub {
          opacity: 0.9;
          margin-top: 4px;
          font-size: 14px;
        }

        .transfer-card__body {
          padding: 28px 24px 22px;
        }

        .status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin-bottom: 22px;
        }

        .status__spinner {
          width: 64px;
          height: 64px;
          border: 5px solid #e6f7ff;
          border-top-color: #00b4d8;
          border-radius: 50%;
          animation: spin 1.1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .status__text {
          font-weight: 700;
          font-size: 20px;
          text-align: center;
          background: linear-gradient(90deg, #00b4d8, #48cae4);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .status__hint {
          opacity: 0.7;
          font-size: 13px;
          text-align: center;
        }

        .transfer-card.success .status__spinner {
          display: none;
        }

        .transfer-card.success .status__text {
          background: none;
          color: #22c55e;
        }

        .transfer-card.error .status__spinner {
          display: none;
        }

        .transfer-card.error .status__text {
          background: none;
          color: #ef4444;
        }

        /* MAP */
        .map {
          margin: 26px auto 14px;
          width: clamp(280px, 86%, 860px);
        }

        .map__bar {
          position: relative;
          height: 14px;
          border-radius: 999px;
          background: #eaf7ff;
          box-shadow: inset 0 0 0 2px rgba(0, 180, 216, 0.08);
        }

        .node {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid #bfefff;
          box-shadow: 0 0 0 2px #e9fbff;
        }

        .node--left {
          left: -6px;
        }

        .node--right {
          right: -6px;
        }

        .node__label {
          position: absolute;
          top: -34px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          color: #334155;
        }

        .node--active {
          box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.35), 0 0 16px rgba(72, 202, 228, 0.65);
        }

        .node--success {
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.25), 0 0 18px rgba(34, 197, 94, 0.6);
        }

        .node--error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25), 0 0 18px rgba(239, 68, 68, 0.6);
        }

        /* TRUCK */
        .truck {
          position: absolute;
          top: -50px;
          left: 0;
          width: 90px;
          height: auto;
          transform: translateX(0);
          filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.15));
          will-change: transform;
          transition: transform 0.1s linear;
        }

        /* Blockchain strip */
        .chain {
          margin: 18px auto 10px;
          width: clamp(300px, 88%, 880px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
        }

        .block {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: #eefbff;
          border: 2px solid #cfefff;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .block--lit {
          border-color: #7EE9F2;
          box-shadow: 0 0 20px 6px rgba(72, 202, 228, 0.55);
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          padding: 14px 24px 22px;
          border-top: 1px solid #eef2f7;
        }
      `}</style>

      <main className={`transfer-card ${isCompleted ? 'success' : ''} ${isError ? 'error' : ''}`}>
        <header className="transfer-card__head">
          <div className="transfer-card__title">Chờ chuyển giao NFT</div>
          <div className="transfer-card__sub">
            {isError
              ? 'Giao dịch blockchain thất bại'
              : isCompleted
              ? 'NFT đã đến Distributor & được xác nhận trên blockchain'
              : 'Đang vận chuyển NFT và xác minh trên blockchain...'}
          </div>
        </header>

        <section className="transfer-card__body">
          <div className="status">
            <div className="status__spinner"></div>
            <div className="status__text">
              {isError
                ? '❌ Chuyển giao thất bại'
                : isCompleted
                ? '✅ Chuyển giao thành công'
                : 'Đang chuyển giao & xác minh...'}
            </div>
            <div className="status__hint">
              {isError
                ? 'Vui lòng kiểm tra lại và thử lại sau.'
                : isCompleted
                ? 'Bạn có thể tiếp tục bước tiếp theo.'
                : 'Vui lòng chờ giao dịch blockchain được xác nhận.'}
            </div>
          </div>

          {/* MAP */}
          <div className="map">
            <div className="map__bar" ref={mapBarRef}>
              <div className={`node node--left ${status === 'minting' || isCompleted || isError ? 'node--active' : ''}`}>
                <span className="node__label">Manufacturer</span>
              </div>

              {/* SVG truck */}
              <img
                ref={truckRef}
                src={truckSvg}
                className="truck"
                alt="truck"
              />

              <div className={`node node--right ${isError ? 'node--error node--active' : isCompleted ? 'node--success node--active' : ''}`}>
                <span className="node__label">Distributor</span>
              </div>
            </div>
          </div>

          {/* CHAIN */}
          <div className="chain">
            <div className={`block ${litBlocks.includes(0) ? 'block--lit' : ''}`}></div>
            <div className={`block ${litBlocks.includes(1) ? 'block--lit' : ''}`}></div>
            <div className={`block ${litBlocks.includes(2) ? 'block--lit' : ''}`}></div>
            <div className={`block ${litBlocks.includes(3) ? 'block--lit' : ''}`}></div>
          </div>
        </section>
      </main>
    </>
  );
}

