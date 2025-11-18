import { useEffect, useRef } from 'react';
import truckSvg from '../assets/truck.svg';

/**
 * TruckLoader
 * Hiệu ứng xe tải chạy để dùng làm loading indicator.
 * Props:
 *  - height: chiều cao khu vực đường ray (px)
 *  - duration: thời gian một vòng chạy (ms) - chỉ dùng khi progress không được cung cấp
 *  - className: bổ sung class ngoài
 *  - showTrack: hiển thị đường ray
 *  - progress: tiến trình (0-1), nếu có thì xe sẽ chạy theo progress này thay vì loop
 */
export default function TruckLoader({
  height = 64,
  duration = 4000,
  className = '',
  showTrack = true,
  progress, // 0-1: progress từ parent
}) {
  const containerRef = useRef(null);
  const truckRef = useRef(null);
  const rafRef = useRef(0);
  const startTimeRef = useRef(0);
  const currentProgressRef = useRef(0);
  const animationFrameRef = useRef(null);

  // Nếu có progress từ parent, dùng smooth interpolation
  useEffect(() => {
    if (progress !== undefined) {
      const updateTruckPosition = () => {
        if (containerRef.current && truckRef.current) {
          const width = containerRef.current.clientWidth;
          const pad = 16;
          const truckWidth = 90;
          const targetProgress = Math.min(Math.max(progress, 0), 1);
          
          // Smooth interpolation để mượt mà
          const currentProgress = currentProgressRef.current;
          const diff = targetProgress - currentProgress;
          const speed = 0.08;
          const newProgress = currentProgress + diff * speed;
          currentProgressRef.current = Math.abs(diff) < 0.001 ? targetProgress : newProgress;
          
          const p = currentProgressRef.current;
          const x = pad + (width - truckWidth - pad * 2) * p;
          truckRef.current.style.transform = `translateX(${x}px)`;
        }
        
        animationFrameRef.current = requestAnimationFrame(updateTruckPosition);
      };
      
      animationFrameRef.current = requestAnimationFrame(updateTruckPosition);
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [progress]);

  // Nếu không có progress, dùng loop animation như cũ
  useEffect(() => {
    if (progress === undefined) {
      const animate = (ts) => {
        if (!startTimeRef.current) startTimeRef.current = ts;
        const elapsed = ts - startTimeRef.current;
        const loopT = elapsed % duration;
        const progress = loopT / duration; // 0..1

        if (containerRef.current && truckRef.current) {
          const width = containerRef.current.clientWidth;
          const pad = 16;
          const truckWidth = 90;
          const x = pad + (width - truckWidth - pad * 2) * progress;
          truckRef.current.style.transform = `translateX(${x}px)`;
        }

        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [duration, progress]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none ${className}`}
      style={{ height }}
    >
      <style>{`
        .truck-loader_track {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 12px;
          border-radius: 999px;
          background: linear-gradient(90deg, #eaf7ff 0%, #f0f9ff 100%);
          box-shadow: inset 0 2px 4px rgba(0, 180, 216, 0.1), inset 0 0 0 2px rgba(0, 180, 216, 0.12);
        }
        .truck-loader_truck {
          position: absolute;
          top: calc(50% - 72px); /* nâng xe lên cao hơn đường ray một chút */
          left: 0;
          width: 90px;
          height: auto;
          filter: drop-shadow(0 6px 16px rgba(0,0,0,.18)) drop-shadow(0 2px 4px rgba(0,180,216,.28));
          transition: transform 0.1s linear;
          will-change: transform;
        }
      `}</style>

      {showTrack && <div className="truck-loader_track" />}

      <img ref={truckRef} src={truckSvg} alt="truck" className="truck-loader_truck" />
    </div>
  );
}


