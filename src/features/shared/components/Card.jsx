import { motion } from 'framer-motion';

export default function Card({ 
  children, 
  title, 
  subtitle,
  className = '',
  onClick,
  hoverable = false 
}) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverable ? { y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } : {}}
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-lg border border-slate-200 p-6
        transition-all
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-xl font-bold text-slate-800 mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-slate-600">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </Component>
  );
}

