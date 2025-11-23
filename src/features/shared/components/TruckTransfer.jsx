import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import manufacturingIcon from "../../../assets/manufacturing.png";
import distributionIcon from "../../../assets/distribution.png";
import pharmacyIcon from "../../../assets/pharmacy.png";
import truckImage from "../../../assets/Truckpp.png";

gsap.registerPlugin(MotionPathPlugin);

/**
 * Truck Transfer Component - Enhanced pharmaceutical supply chain visualization
 *
 * @param {Object} props
 * @param {number} props.duration - Animation duration (seconds)
 * @param {boolean} props.showTrail - Show dotted trail
 * @param {number} props.animationSpeed - Animation speed multiplier
 * @param {function} props.onComplete - Callback when animation completes
 */
const TruckTransfer = ({
  duration = 12,
  showTrail = false,
  animationSpeed = 1,
  onComplete = null,
}) => {
  const carRef = useRef(null);
  const animationRef = useRef(null);
  const smokeContainerRef = useRef(null);

  // Điều chỉnh đường ray lên cao hơn và nằm giữa
  const pathData = `M 70 200
          C 95 44, 154 44, 318 42
          C 640 93, 341 202, 675 256
          C 873 274, 945 226, 948 77`;

  // Stations data - điều chỉnh vị trí các trạm lên cao
  const stations = [
    {
      name: "Nhà sản xuất",
      icon: manufacturingIcon,
      x: 44,
      y: 230,
      color: "#0A7BA8",
      description: "Sản xuất thuốc",
      size: 70,
    },
    {
      name: "Nhà phân phối",
      icon: distributionIcon,
      x: 550,
      y: 80,
      color: "#1F8AC0",
      description: "Phân phối & kiểm tra",
      size: 70,
    },
    {
      name: "Nhà thuốc",
      icon: pharmacyIcon,
      x: 920,
      y: 15,
      color: "#3C4EB7",
      description: "Bán lẻ cho khách hàng",
      size: 70,
    },
  ];

  // Tạo khói chân thực hơn
  const createSmoke = () => {
    if (!smokeContainerRef.current) return;

    const smoke = document.createElement("div");
    const size = gsap.utils.random(8, 16);
    const startOpacity = gsap.utils.random(0.3, 0.5);

    smoke.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle at 30% 30%, 
        rgba(180,180,180,${startOpacity}) 0%, 
        rgba(140,140,140,${startOpacity * 0.8}) 20%,
        rgba(100,100,100,${startOpacity * 0.5}) 50%,
        rgba(80,80,80,${startOpacity * 0.2}) 80%,
        transparent 100%);
      border-radius: 50%;
      pointer-events: none;
      left: ${gsap.utils.random(-8, -2)}px;
      bottom: ${gsap.utils.random(8, 15)}px;
      filter: blur(${gsap.utils.random(1, 3)}px);
    `;

    smokeContainerRef.current.appendChild(smoke);

    const tl = gsap.timeline({
      onComplete: () => {
        smoke.remove();
      },
    });

    tl.to(smoke, {
      y: gsap.utils.random(-60, -80),
      x: gsap.utils.random(-25, 25),
      scale: gsap.utils.random(2.5, 4),
      opacity: 0,
      rotation: gsap.utils.random(-30, 30),
      duration: gsap.utils.random(1.2, 2),
      ease: "power1.out",
    }).to(
      smoke,
      {
        filter: `blur(${gsap.utils.random(6, 10)}px)`,
        duration: gsap.utils.random(1, 1.5),
        ease: "power1.in",
      },
      0
    );

    gsap.to(smoke, {
      x: `+=${gsap.utils.random(-15, 15)}`,
      repeat: 3,
      yoyo: true,
      duration: 0.5,
      ease: "sine.inOut",
    });
  };

  const createSmokeCluster = () => {
    const numParticles = gsap.utils.random(2, 4, 1);
    for (let i = 0; i < numParticles; i++) {
      setTimeout(() => {
        createSmoke();
      }, i * 50);
    }
  };

  useEffect(() => {
    if (carRef.current) {
      animationRef.current = gsap.to(carRef.current, {
        duration: duration / animationSpeed,
        repeat: -1,
        ease: "power1.inOut",
        motionPath: {
          path: "#motion-path-horizontal",
          align: "#motion-path-horizontal",
          autoRotate: 0,
          alignOrigin: [0.5, 0.8],
        },
        rotation: 0,
        onComplete: () => {
          if (onComplete) onComplete();
        },
      });

      const smokeInterval = setInterval(() => {
        createSmokeCluster();
      }, 250);

      return () => {
        clearInterval(smokeInterval);
        if (animationRef.current) {
          animationRef.current.kill();
        }
      };
    }
  }, [duration, animationSpeed, onComplete]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "2000px",
        margin: "0 auto",
        position: "relative",
        padding: "clamp(10px, 2vw, 20px)",
        aspectRatio: "10 / 3.5",
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 1000 700"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          height: "auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Shadow for road */}
        <defs>
          <filter id="roadShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Motion Path - Ẩn (chỉ dùng cho xe chạy) */}
        <path
          id="motion-path-horizontal"
          d={pathData}
          fill="none"
          stroke="none"
          strokeWidth="10"
        />

        {/* Nền đường màu xám (nét liền) */}
        {showTrail && (
          <path
            d={pathData}
            fill="none"
            stroke="#808080"
            strokeWidth="35"
            strokeLinecap="round"
            filter="url(#roadShadow)"
          />
        )}

        {/* Nét đứt màu trắng ở giữa */}
        {showTrail && (
          <path
            d={pathData}
            fill="none"
            stroke="white"
            strokeWidth="5"
            strokeDasharray="20 15"
            strokeLinecap="round"
          />
        )}

        {/* Station markers with animations */}
        {stations.map((station, index) => {
          const iconSize = station.size || 34;
          const iconRadius = iconSize / 2 + 4;
          return (
            <g key={index}>
              {/* Pulsing circle background */}

              {/* Icon */}
              <image
                href={station.icon}
                x={station.x + 25 - iconSize / 2}
                y={station.y + 25 - iconSize / 2}
                width={iconSize}
                height={iconSize}
                style={{ pointerEvents: "none" }}
              />

              {/* Station label - responsive */}
              <g transform={`translate(${station.x + 25}, ${station.y + 75})`}>
                <rect
                  x="-55"
                  y="-12"
                  width="110"
                  height="24"
                  rx="12"
                  fill="white"
                  opacity="0.95"
                  filter="drop-shadow(0 2px 8px rgba(0,0,0,0.1))"
                />
                <text
                  textAnchor="middle"
                  y="4"
                  fill={station.color}
                  fontSize="clamp(10, 12, 13)"
                  fontWeight="600"
                >
                  {station.name}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Vehicle with Smoke */}
      <div
        ref={carRef}
        style={{
          position: "absolute",
          width: "clamp(35px, 7vw, 60px)",
          height: "clamp(35px, 7vw, 60px)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.25))",
          zIndex: 10,
          transition: "filter 0.3s ease",
        }}
      >
        {/* Smoke Container */}
        <div
          ref={smokeContainerRef}
          style={{
            position: "absolute",
            width: "200%",
            height: "200%",
            pointerEvents: "none",
            overflow: "visible",
            left: "-50%",
            top: "-50%",
          }}
        />

        {/* Truck Image */}
        <img
          src={truckImage}
          alt="Truck"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
};

export default TruckTransfer;