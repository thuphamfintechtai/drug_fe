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
 * @param {string} props.bgColor - Background color
 * @param {number} props.animationSpeed - Animation speed multiplier
 * @param {function} props.onComplete - Callback when animation completes
 */
const TruckTransfer = ({
  duration = 12,
  showTrail = false,
  bgColor = "#F7F5EF",
  animationSpeed = 1,
  onComplete = null,
}) => {
  const carRef = useRef(null);
  const trailRef = useRef(null);
  const animationRef = useRef(null);
  const smokeContainerRef = useRef(null);

  // Điều chỉnh đường ray lên cao hơn và nằm giữa
  const pathData = `M 62 245
          C 95 64, 154 65, 318 62
          C 640 113, 341 222, 675 276
          C 873 294, 945 246, 948 97`;

  // Stations data - điều chỉnh vị trí các trạm lên cao
  const stations = [
    {
      name: "Nhà sản xuất",
      icon: manufacturingIcon,
      x: 35,
      y: 250,
      color: "#0A7BA8",
      description: "Sản xuất thuốc",
      size: 30  ,
    },
    {
      name: "Nhà phân phối",
      icon: distributionIcon,
      x: 500,
      y: 160,
      color: "#1F8AC0",
      description: "Phân phối & kiểm tra",
      size: 30,
    },
    {
      name: "Nhà thuốc",
      icon: pharmacyIcon,
      x: 920,
      y: 15,
      color: "#3C4EB7",
      description: "Bán lẻ cho khách hàng",
      size: 30,
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

      if (showTrail && trailRef.current) {
        gsap.fromTo(
          trailRef.current,
          { strokeDashoffset: 1000 },
          {
            strokeDashoffset: 0,
            duration: duration / animationSpeed,
            repeat: -1,
            ease: "none",
          }
        );
      }

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
  }, [duration, showTrail, animationSpeed, onComplete]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        position: "relative",
        background: `linear-gradient(135deg, ${bgColor} 0%, #E8F4F8 100%)`,
        padding: "clamp(10px, 2vw, 20px)",
        borderRadius: "clamp(12px, 2vw, 20px)",
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5) inset",
        aspectRatio: "10 / 3.5",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `radial-gradient(circle at 2px 2px, #06B6D4 1px, transparent 0)`,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

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
        {/* Glow effect for path */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0A7BA8" stopOpacity="0.75" />
            <stop offset="45%" stopColor="#1F8AC0" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#3C4EB7" stopOpacity="0.75" />
          </linearGradient>
        </defs>

        {/* Motion Path with gradient */}
        <path
          ref={trailRef}
          id="motion-path-horizontal"
          d={pathData}
          fill="none"
          stroke={showTrail ? "url(#pathGradient)" : "none"}
          strokeWidth="10"
          strokeDasharray="15"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Station markers with animations */}
        {stations.map((station, index) => {
          const iconSize = station.size || 34;
          const iconRadius = iconSize / 2 + 4;
          return (
            <g key={index}>
            {/* Pulsing circle background */}
            <circle
              cx={station.x + 25}
              cy={station.y + 25}
              r="30"
              fill={station.color}
              opacity="0.15"
            >
              <animate
                attributeName="r"
                values="35;42;35"
                dur="2s"
                repeatCount="indefinite"
                begin={`${index * 0.5}s`}
              />
              <animate
                attributeName="opacity"
                values="0.15;0.05;0.15"
                dur="2s"
                repeatCount="indefinite"
                begin={`${index * 0.5}s`}
              />
            </circle>

            {/* Station icon circle */}
            <circle
              cx={station.x + 25}
              cy={station.y + 25}
              r={iconRadius}
              fill="white"
              stroke={station.color}
              strokeWidth="3"
              filter="drop-shadow(0 4px 12px rgba(0,0,0,0.15))"
            />

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

            {/* Step number */}
            <circle
              cx={station.x + 45}
              cy={station.y + 8}
              r="12"
              fill={station.color}
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
            />
            <text
              x={station.x + 45}
              y={station.y + 13}
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="700"
            >
              {index + 1}
            </text>
          </g>
          );
        })}

        {/* Decorative elements - pills/capsules */}
        <g opacity="0.1">
          <ellipse cx="150" cy="480" rx="8" ry="15" fill="#10B981" />
          <ellipse cx="800" cy="450" rx="8" ry="15" fill="#3B82F6" />
          <circle cx="300" cy="150" r="10" fill="#8B5CF6" />
          <circle cx="700" cy="180" r="8" fill="#10B981" />
        </g>
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