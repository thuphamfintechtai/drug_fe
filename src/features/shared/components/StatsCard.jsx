import { motion } from 'framer-motion';

export default function StatsCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color = 'blue',
  trend 
}) {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-cyan-500',
      text: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    green: {
      bg: 'from-green-500 to-emerald-500',
      text: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    purple: {
      bg: 'from-purple-500 to-pink-500',
      text: 'text-purple-600',
      iconBg: 'bg-purple-100',
    },
    orange: {
      bg: 'from-orange-500 to-amber-500',
      text: 'text-orange-600',
      iconBg: 'bg-orange-100',
    },
    red: {
      bg: 'from-red-500 to-rose-500',
      text: 'text-red-600',
      iconBg: 'bg-red-100',
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 transition-all hover:shadow-xl"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-xl ${colors.iconBg} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        {trend && (
          <div className={`text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
      <p className={`text-3xl font-bold ${colors.text} mb-1`}>
        {value?.toLocaleString() || '0'}
      </p>
      {subtitle && (
        <p className="text-xs text-slate-500">{subtitle}</p>
      )}
    </motion.div>
  );
}

