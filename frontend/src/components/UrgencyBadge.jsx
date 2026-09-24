import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function UrgencyBadge({ urgency, showHindi = true, size = 'md' }) {
  if (!urgency) return null;

  const u = urgency.toUpperCase();

  const configs = {
    LOW: {
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-500/20',
      dot: 'bg-emerald-600',
      icon: CheckCircle2,
      labelEn: 'LOW URGENCY',
      labelHi: 'सामान्य (घर पर निगरानी रखें)',
    },
    MODERATE: {
      badge: 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-500/20',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      labelEn: 'MODERATE URGENCY',
      labelHi: 'मध्यम (जांच की जरूरत)',
    },
    HIGH: {
      badge: 'bg-rose-50 text-rose-900 border-rose-300 ring-2 ring-rose-500/30 animate-pulse',
      dot: 'bg-rose-600',
      icon: ShieldAlert,
      labelEn: 'HIGH EMERGENCY',
      labelHi: 'गंभीर (तुरंत डॉक्टर को दिखाएं)',
    },
  };

  const current = configs[u] || {
    badge: 'bg-slate-100 text-slate-800 border-slate-300 ring-1 ring-slate-400/20',
    dot: 'bg-slate-500',
    icon: AlertCircle,
    labelEn: u,
    labelHi: 'समीक्षा',
  };

  const Icon = current.icon;

  const sizeClasses = size === 'sm' 
    ? 'px-2.5 py-1 text-[11px] gap-1.5' 
    : 'px-3 py-1.5 text-xs gap-2';

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border shadow-xs tracking-tight ${sizeClasses} ${current.badge}`}
    >
      <Icon size={size === 'sm' ? 13 : 15} className="shrink-0" />
      <span className="font-extrabold">{current.labelEn}</span>
      {showHindi && (
        <span className="text-[10px] font-semibold opacity-90 pl-1 border-l border-current/20 hidden sm:inline">
          {current.labelHi}
        </span>
      )}
    </span>
  );
}
