import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// NFT Token SVG Component
const NFTToken = ({ index, delay = 0, onComplete }) => {
  const angle = -20 + (index * 20); // -20°, 0°, +20°, etc.
  const distance = 120 + (index * 10); // Vary distance slightly
  
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0.8,
        x: 0,
        y: 0,
      }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0.8, 1.2, 1, 0.5],
        x: Math.sin((angle * Math.PI) / 180) * distance,
        y: -distance,
      }}
      transition={{
        duration: 2.5,
        delay: delay,
        times: [0, 0.1, 0.7, 1],
        ease: [0.33, 1, 0.68, 1], // Custom easing for smooth curve
      }}
      onAnimationComplete={onComplete}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 180, 216, 0.4))' }}>
        <defs>
          <linearGradient id={`nft-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#48cae4" />
            <stop offset="100%" stopColor="#00b4d8" />
          </linearGradient>
          <filter id={`nft-glow-${index}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Main token body */}
        <rect 
          x="4" 
          y="4" 
          width="16" 
          height="16" 
          rx="3" 
          fill={`url(#nft-grad-${index})`}
          stroke="#00b4d8" 
          strokeWidth="1.5"
          filter={`url(#nft-glow-${index})`}
        />
        {/* Inner highlight */}
        <rect 
          x="6" 
          y="6" 
          width="12" 
          height="12" 
          rx="2" 
          fill="rgba(255, 255, 255, 0.3)"
        />
        {/* Corner accent */}
        <circle cx="8" cy="8" r="1.5" fill="rgba(255, 255, 255, 0.6)" />
        <circle cx="16" cy="16" r="1.5" fill="rgba(255, 255, 255, 0.6)" />
      </svg>
    </motion.div>
  );
};

// Sparkle effect for final token
const Sparkle = ({ delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration: 0.8,
        delay: delay,
        times: [0, 0.5, 1],
      }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '8px',
        height: '8px',
        background: '#fff',
        borderRadius: '50%',
        boxShadow: '0 0 8px rgba(255, 255, 255, 0.8), 0 0 16px rgba(0, 180, 216, 0.6)',
        zIndex: 15,
        pointerEvents: 'none',
      }}
    />
  );
};

export default function NFTMintButton({
  onClick,
  disabled = false,
  buttonState = 'idle', // 'idle' | 'minting' | 'completed'
  defaultText = 'Bước 2: Mint NFT',
  mintingText = 'Minting...',
  successText = ' Mint thành công!',
  loading = false,
  className = '',
  onAnimationComplete,
}) {
  const [tokens, setTokens] = useState([]);
  const [completedTokens, setCompletedTokens] = useState(0);
  const tokenCount = 5;

  // Reset tokens when state changes
  useEffect(() => {
    if (buttonState === 'minting') {
      setTokens(Array.from({ length: tokenCount }, (_, i) => i));
      setCompletedTokens(0);
    } else if (buttonState === 'idle') {
      setTokens([]);
      setCompletedTokens(0);
    }
    // Keep tokens in completed state to show sparkle
  }, [buttonState]);

  const handleTokenComplete = () => {
    setCompletedTokens(prev => {
      const newCount = prev + 1;
      return newCount;
    });
  };

  // Trigger onAnimationComplete when all tokens are done
  useEffect(() => {
    if (buttonState === 'minting' && completedTokens === tokenCount && onAnimationComplete) {
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [completedTokens, tokenCount, buttonState, onAnimationComplete]);

  return (
    <>
      <style>{`
        .nft-mint-button {
          position: relative;
          background: linear-gradient(135deg, #00b4d8 0%, #48cae4 100%);
          color: #fff;
          font-size: 15px;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          border: none;
          padding: 16px 36px;
          border-radius: 12px;
          cursor: pointer;
          overflow: visible;
          transition: all 0.3s ease;
          min-width: 180px;
          box-shadow: 0 4px 14px rgba(0, 180, 216, 0.3);
        }
        .nft-mint-button:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(0, 180, 216, 0.4);
          transform: translateY(-1px);
        }
        .nft-mint-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .nft-mint-button.completed {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);
        }
        .nft-mint-button span {
          position: relative;
          z-index: 2;
          display: block;
          transition: opacity 0.3s;
        }
      `}</style>
      <button
        onClick={onClick}
        disabled={disabled || loading || buttonState === 'minting' || buttonState === 'completed'}
        className={`nft-mint-button ${buttonState === 'completed' ? 'completed' : ''} ${className}`}
      >
        <span>
          {buttonState === 'idle' && (loading ? mintingText : defaultText)}
          {buttonState === 'minting' && mintingText}
          {buttonState === 'completed' && successText}
        </span>
        
        {/* NFT Tokens flying up */}
        <AnimatePresence>
          {buttonState === 'minting' && tokens.map((token, index) => (
            <NFTToken
              key={token}
              index={index}
              delay={index * 0.15}
              onComplete={handleTokenComplete}
            />
          ))}
        </AnimatePresence>

        {/* Sparkle effects when all tokens complete */}
        {buttonState === 'completed' && completedTokens >= tokenCount && (
          <>
            {[...Array(5)].map((_, i) => (
              <Sparkle key={`sparkle-${i}`} delay={i * 0.1} />
            ))}
          </>
        )}
      </button>
    </>
  );
}

