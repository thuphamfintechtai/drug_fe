import { useState } from "react";
import { motion } from "framer-motion";
import humanSvg from "../assets/humanrun.svg";

export default function LogoutButton({ onLogout }) {
  const [animating, setAnimating] = useState(false);
  const [done, setDone] = useState(false);

  const handleClick = () => {
    if (animating || done) return;
    setAnimating(true);
    setTimeout(() => {
      setDone(true);
      setAnimating(false);
      if (onLogout) onLogout();
      setTimeout(() => setDone(false), 2000);
    }, 1300);
  };

  return (
    <button
      onClick={handleClick}
      disabled={animating}
      className={`relative flex items-center h-10 px-4 rounded-full font-medium text-sm 
      !text-white transition-all shadow-md
      ${done ? "bg-red-500 hover:bg-red-600" : "bg-red-500 hover:bg-red-600"} 
      ${animating || done ? "opacity-80" : "hover:translate-y-[-2px]"}`}
    >
      <span className="relative z-10 !text-white">
        {done ? "Đã đăng xuất" : animating ? "Đăng xuất…" : "Đăng xuất"}
      </span>

      {/* Animated icon: person walking through door */}
      <svg className="w-16 h-8 -ml-2" viewBox="0 0 220 110">
        <defs>
          <linearGradient id="doorGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* Floor thanh gạch dưới */}
        <rect x="50" y="78" width="150" height="10" rx="5" fill="#e5e7eb" />

        {/* Walking person */}
        <motion.g
          animate={{
            x: animating ? [0, 90] : 0,
            opacity: animating ? [1, 0.9, 0.5] : 1,
          }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 0.8, 0.32, 1] }}
        >
          <image href={humanSvg} x="50" y="20" width="55" height="63" />
        </motion.g>

        {/* Door frame */}
        <g transform="translate(150,20) scale(0.9)">
          {/* Khung cửa ngoài */}
          <rect
            x="0"
            y="0"
            width="52"
            height="70"
            rx="8"
            fill="#fee2e2"
            stroke="#fca5a5"
            strokeWidth="1.5"
          />

          {/* Cánh cửa mở ra */}
          <motion.g
            animate={{ rotateY: animating ? [0, -75, -75] : 0 }}
            style={{ transformOrigin: "left center" }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          >
            {/* Gradient đỏ cho cánh cửa */}
            <defs>
              <linearGradient id="doorGradRed" x1="0" x2="1">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>

            <rect
              x="5"
              y="5"
              width="42"
              height="60"
              rx="4"
              fill="url(#doorGradRed)"
            />
            <rect x="5" y="5" width="2.5" height="60" rx="2" fill="#b91c1c" />
            <circle cx="41" cy="35" r="2.8" fill="#fee2e2" />
          </motion.g>
        </g>
      </svg>
    </button>
  );
}
