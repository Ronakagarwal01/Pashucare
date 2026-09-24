import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/api';
import UrgencyBadge from '../components/UrgencyBadge';
import EmptyState from '../components/EmptyState';
import { 
  LayoutDashboard, 
  Loader2, 
  PawPrint, 
  MessageSquarePlus, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  Calendar,
  Plus,
  ShieldAlert,
  CheckCircle2,
  FileText
} from 'lucide-react';

const SPECIES_ICONS = {
  cow: '🐄',
  buffalo: '🐃',
  goat: '🐐',
  dog: '🐕',
  cat: '🐈',
  poultry: '🐓',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
        <p className="text-sm font-bold text-slate-700">PashuCare डेटा लोड हो रहा है / Loading Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-rose-50 border-2 border-rose-200 text-rose-900 p-5 rounded-2xl text-sm font-semibold">
          डैशबोर्ड लोड नहीं हो सका: {error}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      labelEn: 'Registered Animals',
      labelHi: 'पंजीकृत पशु',
      value: data.total_animals,
      sub: 'गाय, भैंस, बकरी व पालतू जानवर',
      icon: PawPrint,
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      labelEn: 'Total Consultations',
      labelHi: 'कुल परामर्श सत्र',
      value: data.total_consultations,
      sub: 'सम्पन्न AI ट्रायेज सत्र',
      icon: MessageSquarePlus,
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      labelEn: 'Active Care Alerts',
      labelHi: 'सक्रिय स्वास्थ्य अलर्ट',
      value: data.active_alerts,
      sub: 'मध्यम या गंभीर आपात मामले',
      icon: AlertTriangle,
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              पशु चिकित्सा क्लिनिकल डैशबोर्ड
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Live Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Clinical Health Dashboard • पशु स्वास्थ्य की वास्तविक स्थिति, गंभीर अलर्ट और हालिया परामर्श की लाइव सूची
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/animals"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 cursor-pointer"
          >
            <PawPrint size={15} className="text-slate-600" />
            <span>पशु सूची (Animals)</span>
          </Link>

          <Link
            to="/consultation"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all cursor-pointer"
          >
            <Sparkles size={15} />
            <span>नया परामर्श (New Triage)</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statCards.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.labelEn}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 card-hover shadow-xs flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {m.labelHi} ({m.labelEn})
                </span>
                <p className="text-4xl font-black text-slate-900 font-heading tracking-tight">
                  {m.value}
                </p>
                <p className="text-xs text-slate-600 font-medium pt-1">{m.sub}</p>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 ${m.bg}`}>
                <Icon size={28} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Helper Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-6 sm:p-7 text-white flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
            <CheckCircle2 size={24} className="text-emerald-300" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold font-heading">
              क्या आपके पशु में अस्वस्थता के कोई लक्षण दिख रहे हैं?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              तुरंत ट्रायेज शुरू करें और 2 मिनट में प्राथमिक सहायता व डॉक्टर सलाह प्राप्त करें।
            </p>
          </div>
        </div>

        <Link
          to="/consultation"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Sparkles size={16} className="text-emerald-700" />
          <span>परामर्श शुरू करें / Start Triage</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Recent Consultations Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        
        {/* Table Header Bar */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">
              हालिया क्लिनिकल परामर्श • Recent Clinical Records
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              रिपोर्ट किए गए लक्षण, गंभीरता स्तर और ट्रायेज निर्णय
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>सभी रिकॉर्ड देखें (View All History)</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {data.recent_consultations.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={LayoutDashboard}
              title="कोई पूर्व परामर्श दर्ज नहीं है"
              description="अपने पशु के स्वास्थ्य की पहली जांच शुरू करने के लिए 'नया परामर्श' पर क्लिक करें।"
              actionText="+ नया परामर्श शुरू करें"
              onAction={() => window.location.href = '/consultation'}
            />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">पशु प्रोफाइल (Animal)</th>
                  <th className="px-6 py-4 hidden md:table-cell">मुख्य लक्षण (Primary Concern)</th>
                  <th className="px-6 py-4">दिनांक (Date)</th>
                  <th className="px-6 py-4">गंभीरता (Urgency)</th>
                  <th className="px-6 py-4 text-right">कार्य (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {data.recent_consultations.map((c) => {
                  const speciesKey = c.animal?.species?.toLowerCase() || '';
                  const emoji = SPECIES_ICONS[speciesKey] || '🐾';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Animal Profile */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-lg flex items-center justify-center shrink-0 shadow-2xs">
                            {emoji}
                          </div>
                          <div>
                            <Link
                              to={`/history/${c.id}`}
                              className="font-extrabold text-slate-900 hover:text-emerald-700 transition-colors text-sm font-heading block"
                            >
                              {c.animal?.name || 'अज्ञात पशु'}
                            </Link>
                            <span className="text-xs text-slate-600 font-medium">
                              {c.animal?.species} {c.animal?.breed ? `• ${c.animal.breed}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Primary Concern */}
                      <td className="px-6 py-4.5 text-slate-700 hidden md:table-cell max-w-sm truncate text-xs">
                        {c.summary || 'परामर्श सत्र प्रारंभ हुआ।'}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4.5 text-slate-600 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar size={14} className="text-slate-400" />
                          <span>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Urgency */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <UrgencyBadge urgency={c.urgency || 'LOW'} size="sm" />
                      </td>

                      {/* Action Links */}
                      <td className="px-6 py-4.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/history/${c.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 font-bold text-xs transition-colors"
                          >
                            <span>जांचें (Review)</span>
                          </Link>
                          <Link
                            to={`/case-summary/${c.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs transition-colors"
                            title="Printable Summary Report"
                          >
                            <FileText size={13} />
                            <span className="hidden sm:inline">रिपोर्ट</span>
                          </Link>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
