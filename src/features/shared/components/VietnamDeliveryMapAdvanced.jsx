import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import banDoVietNam from '../../../assets/BanDo.png';
import truckImage from '../../../assets/Truckpp.png';

gsap.registerPlugin(MotionPathPlugin);

/**
 * Vietnam Delivery Map Component - Simplified version
 * 
 * @param {Object} props
 * @param {number} props.duration - Animation duration (seconds)
 * @param {boolean} props.showTrail - Show dotted trail
 * @param {number} props.animationSpeed - Animation speed multiplier
 * @param {function} props.onComplete - Callback when animation completes
 * @param {string|number} props.maxWidth - Maximum width of container (e.g., '300px', '500px', 600)
 * @param {string|number} props.vehicleSize - Size of vehicle (e.g., 'clamp(30px, 6vw, 50px)', '40px', 50)
 */
const VietnamDeliveryMapAdvanced = ({
  duration = 12,
  showTrail = true,
  animationSpeed = 1,
  onComplete = null,
  maxWidth = '250px',
  vehicleSize = 'clamp(28px, 5vw, 40px)',
}) => {
  const carRef = useRef(null);
  const animationRef = useRef(null);

  const pathData = `M 182 73
          C 78 174, 101 208, 107 217
          C 163 339, 166 300, 209 361
          C 250 427, 267 426, 257 526
          C 251 649, 104 695, 67 746`;

  // Tính toán scale factor dựa trên maxWidth
  const getMaxWidthValue = (width) => {
    if (typeof width === 'number') return width;
    const match = width.match(/(\d+)/);
    return match ? parseFloat(match[1]) : 300;
  };

  const baseWidth = 300;
  const currentMaxWidth = getMaxWidthValue(maxWidth);
  const scaleFactor = currentMaxWidth / baseWidth;

  const strokeWidth = Math.max(2, Math.round(3 * scaleFactor));

  useEffect(() => {
    if (carRef.current) {
      animationRef.current = gsap.to(carRef.current, {
        duration: duration / animationSpeed,
        repeat: -1,
        ease: "power1.inOut",
        motionPath: {
          path: "#motion-path",
          align: "#motion-path",
          autoRotate: 180,
          alignOrigin: [0.5, 0.5]
        },
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [duration, animationSpeed, onComplete]);

  return (
    <div 
      style={{
        width: '100%',
        maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
        margin: '0 auto',
        position: 'relative',
        backgroundImage: `url(${banDoVietNam})`,
        backgroundSize: 'cover',
        backgroundPosition: '25% center',
        backgroundRepeat: 'no-repeat',
        padding: 'clamp(15px, 4vw, 30px)',
        paddingBottom: 'clamp(30px, 6vw, 45px)',
        borderRadius: 'clamp(12px, 2vw, 20px)',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        aspectRatio: '5 / 7',
        overflow: 'visible',
        imageRendering: 'crisp-edges',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        filter: 'contrast(1.05) brightness(1.0) saturate(1.0)'
      }}
    >
      <svg
        viewBox="0 0 500 720"
        xmlns="http://www.w3.org/2000/svg"
        style={{ 
          width: '100%', 
          height: 'auto', 
          position: 'relative', 
          zIndex: 1,
          overflow: 'visible',
          shapeRendering: 'geometricPrecision'
        }}
      >
        {/* Đường ray - ẩn */}
        <path
          id="motion-path"
          d={pathData}
          fill="none"
          stroke="none"
          strokeWidth={strokeWidth}
          strokeDasharray={Math.round(8 * scaleFactor)}
          style={{ 
            pointerEvents: 'none'
          }}
        />
      </svg>

      {/* Vehicle */}
      <div
        ref={carRef}
        style={{
          position: 'absolute',
          width: typeof vehicleSize === 'number' ? `${vehicleSize}px` : vehicleSize,
          height: typeof vehicleSize === 'number' ? `${vehicleSize}px` : vehicleSize,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.35))',
          zIndex: 100,
          transition: 'filter 0.3s ease',
          pointerEvents: 'none'
        }}
      >
        <img 
          src={truckImage}
          alt="Truck" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            transform: 'rotate(180deg) scaleY(-1)'
          }}
        />
      </div>
    </div>
  );
};

export default VietnamDeliveryMapAdvanced;