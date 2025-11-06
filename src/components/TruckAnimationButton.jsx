import truckSVG from '../assets/truck.svg';

export default function TruckAnimationButton({
  onClick,
  disabled = false,
  buttonState = 'idle', // 'idle' | 'uploading' | 'completed'
  defaultText = 'Xác nhận',
  uploadingText = 'Đang xử lý...',
  successText = 'Hoàn thành',
  loading = false,
  className = '',
  animationDuration = 2.5, // seconds
  animationMode = 'once', // 'once' | 'infinite'
}) {
  return (
    <>
      <style>{`
        .truck-animation-button {
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
          overflow: hidden;
          transition: all 0.3s ease;
          min-width: 220px;
          box-shadow: 0 4px 14px rgba(0, 180, 216, 0.3);
        }
        .truck-animation-button:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(0, 180, 216, 0.4);
          transform: translateY(-1px);
        }
        .truck-animation-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .truck-animation-button span {
          position: relative;
          z-index: 2;
          display: block;
          transition: opacity 0.3s;
        }
        .truck-animation-button .success-text {
          opacity: 0;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
        }
        .truck-container {
          position: absolute;
          left: 30%;
          bottom: 8px;
          width: 60px;
          height: 30px;
          transform: translateY(-50%) translateX(-120%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .truck-svg-button {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
        }
        .road-line {
          position: absolute;
          bottom: -8px;
          left: 10%;
          width: 80%;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
          overflow: hidden;
        }
        .road-line::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
          animation: roadFlow 1.5s linear infinite;
        }
        @keyframes roadFlow {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .truck-animation-button.uploading .default-text {
          opacity: 0;
        }
        .truck-animation-button.uploading .truck-container {
          opacity: 1;
        }
        .truck-animation-button.uploading.once .truck-container {
          animation: truckDriveAnimation 2.5s linear forwards;
        }
        .truck-animation-button.uploading.infinite .truck-container {
          animation: truckDriveAnimation var(--truck-animation-duration, 3s) linear infinite;
        }
        .truck-animation-button.uploading .road-line {
          opacity: 1;
        }
        @keyframes truckDriveAnimation {
          0% { transform: translateY(-50%) translateX(-120%); }
          100% { transform: translateY(-50%) translateX(250%); }
        }
        .truck-animation-button.completed {
          background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
          box-shadow: 0 4px 14px rgba(74, 222, 128, 0.4);
        }
        .truck-animation-button.completed .truck-container {
          opacity: 0;
        }
        .truck-animation-button.completed .road-line {
          opacity: 0;
        }
        .truck-animation-button.completed .default-text {
          opacity: 0;
        }
        .truck-animation-button.completed .success-text {
          opacity: 1;
          animation: checkmarkGlow 2s ease-in-out;
        }
        @keyframes checkmarkGlow {
          0%, 100% { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(1.05);
          }
        }
        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #fff;
          border-radius: 50%;
          opacity: 0;
          pointer-events: none;
          box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
        }
        .truck-animation-button.completed .sparkle {
          animation: sparklePop 0.8s ease-out forwards;
        }
        .sparkle-1 { top: 20%; left: 20%; animation-delay: 0s; }
        .sparkle-2 { top: 30%; right: 25%; animation-delay: 0.1s; }
        .sparkle-3 { bottom: 25%; left: 30%; animation-delay: 0.2s; }
        .sparkle-4 { bottom: 35%; right: 30%; animation-delay: 0.3s; }
        .sparkle-5 { top: 50%; left: 50%; animation-delay: 0.15s; }
        @keyframes sparklePop {
          0% {
            opacity: 0;
            transform: scale(0) translate(0, 0);
          }
          50% {
            opacity: 1;
            transform: scale(1.5) translate(0, -10px);
          }
          100% {
            opacity: 0;
            transform: scale(0.3) translate(0, -20px);
          }
        }
      `}</style>
      <button
        onClick={onClick}
        disabled={disabled || loading || buttonState === 'uploading' || buttonState === 'completed'}
        className={`truck-animation-button ${buttonState === 'uploading' ? `uploading ${animationMode}` : ''} ${buttonState === 'completed' ? 'completed' : ''} ${className}`}
        style={{
          '--truck-animation-duration': `${animationDuration}s`
        }}
      >
        <span className="default-text">
          {loading ? uploadingText : (buttonState === 'idle' ? defaultText : uploadingText)}
        </span>
        <span className="success-text">{successText}</span>
        
        {/* Truck SVG */}
        <div className="truck-container">
          <img 
            src={truckSVG} 
            alt="Truck" 
            className="truck-svg-button"
            style={{ filter: 'hue-rotate(240deg) saturate(1.2) brightness(1.1)' }}
          />
        </div>
        
        {/* Road line */}
        <div className="road-line"></div>
        
        {/* Sparkle effects */}
        {buttonState === 'completed' && (
          <>
            <div className="sparkle sparkle-1"></div>
            <div className="sparkle sparkle-2"></div>
            <div className="sparkle sparkle-3"></div>
            <div className="sparkle sparkle-4"></div>
            <div className="sparkle sparkle-5"></div>
          </>
        )}
      </button>
    </>
  );
}

