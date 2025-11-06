import { useEffect, useRef } from 'react';
import truckSvg from '../assets/truck.svg';

/**
 * TruckLoader
 * Hiệu ứng xe tải chạy để dùng làm loading indicator.
 * Props:
 *  - height: chiều cao khu vực đường ray (px)
 *  - duration: thời gian một vòng chạy (ms)
 *  - className: bổ sung class ngoài
 *  - showTrack: hiển thị đường ray
 */
export default function TruckLoader({
  height = 64,
  duration = 4000,
  className = '',
  showTrack = true,
}) {
  const containerRef = useRef(null);
  const truckRef = useRef(null);
  const rafRef = useRef(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const animate = (ts) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const loopT = elapsed % duration;
      const progress = loopT / duration; // 0..1

      if (containerRef.current && truckRef.current) {
        const width = containerRef.current.clientWidth;
        const pad = 16;
        const truckWidth = 90; // gần đúng theo truck.svg
        const x = pad + (width - truckWidth - pad * 2) * progress;
        truckRef.current.style.transform = `translateX(${x}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration]);

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


