import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Activity, MessageSquarePlus, LayoutDashboard, PawPrint, History, Sparkles, HeartPulse } from 'lucide-react';

const NAV_LINKS = [
  { to: '/dashboard', labelEn: 'Dashboard', labelHi: 'डैशबोर्ड', icon: LayoutDashboard },
  { to: '/consultation', labelEn: 'AI Consultation', labelHi: 'परामर्श', icon: MessageSquarePlus },
  { to: '/animals', labelEn: 'Animal Profiles', labelHi: 'पशु सूची', icon: PawPrint },
  { to: '/history', labelEn: 'History', labelHi: 'इतिहास', icon: History },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="glass-nav sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Bilingual Tagline */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 group-hover:scale-105 transition-transform shrink-0">
              <HeartPulse size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
                  PashuCare<span className="text-emerald-600">.AI</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  पशु सेवा
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium hidden sm:block">
                पशु स्वास्थ्य एवं देखभाल • AI Animal Healthcare Assistant
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-sm font-black'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/60 font-semibold'
                  }`}
                >
                  <Icon size={17} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-xs font-bold">{link.labelEn}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{link.labelHi}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Action Button & Engine Status */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>24/7 AI Healthcare Active</span>
            </div>
            
            <Link
              to="/consultation"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all cursor-pointer"
            >
              <Sparkles size={15} />
              <span>परामर्श लें / Start Consultation</span>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {open && (
          <div className="lg:hidden py-4 px-3 border-t border-slate-200 space-y-2 bg-white rounded-b-2xl shadow-xl">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'text-slate-800 hover:bg-slate-50 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={isActive ? 'text-emerald-600' : 'text-slate-500'} />
                    <span className="text-sm">{link.labelEn}</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{link.labelHi}</span>
                </Link>
              );
            })}
            <div className="pt-2">
              <Link
                to="/consultation"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-sm"
              >
                <Sparkles size={16} />
                <span>नया परामर्श शुरू करें / Start Consultation</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
