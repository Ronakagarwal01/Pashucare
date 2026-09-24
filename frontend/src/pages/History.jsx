import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getConsultations, getConsultation } from '../services/api';
import UrgencyBadge from '../components/UrgencyBadge';
import ChatMessage from '../components/ChatMessage';
import EmptyState from '../components/EmptyState';
import { 
  Loader2, 
  ArrowLeft, 
  FileText, 
  History as HistoryIcon, 
  Calendar, 
  Search, 
  PawPrint, 
  ChevronRight,
  Sparkles,
  MessageSquare
} from 'lucide-react';

const SPECIES_ICONS = {
  cow: '🐄',
  buffalo: '🐃',
  goat: '🐐',
  dog: '🐕',
  cat: '🐈',
  poultry: '🐓',
};

export default function History() {
  const { id } = useParams();
  const [consultations, setConsultations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    if (id) {
      getConsultation(id)
        .then(setSelected)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else {
      setSelected(null);
      getConsultations()
        .then(setConsultations)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
        <p className="text-sm font-bold text-slate-700">परामर्श इतिहास लोड हो रहा है / Loading Records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="p-5 bg-rose-50 border-2 border-rose-200 text-rose-900 rounded-2xl text-sm font-semibold">
          इतिहास लोड नहीं हो सका: {error}
        </div>
      </div>
    );
  }

  // Consultation Detail View
  if (selected) {
    const speciesKey = selected.animal?.species?.toLowerCase() || '';
    const emoji = SPECIES_ICONS[speciesKey] || '🐾';

    return (
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-6">
        
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft size={16} /> <span>← सभी परामर्श सूची पर वापस जाएं (Back to Logs)</span>
        </Link>

        {/* Top Meta Card */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-3xl flex items-center justify-center shrink-0">
              {emoji}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  परामर्श सत्र #{selected.id}
                </h1>
                <UrgencyBadge urgency={selected.urgency || 'LOW'} size="sm" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                पशु: <strong className="text-slate-900 font-extrabold">{selected.animal?.name}</strong> ({selected.animal?.species} {selected.animal?.breed ? `• ${selected.animal.breed}` : ''}) • दिनांक: {new Date(selected.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <Link
            to={`/case-summary/${selected.id}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-2xl shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer"
          >
            <FileText size={16} />
            <span>क्लिनिकल केस समरी देखें / View Summary</span>
          </Link>
        </div>

        {/* Messages Transcript */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 font-heading">
              <MessageSquare size={18} className="text-emerald-600" />
              <span>परामर्श संवाद विवरण ({selected.messages?.length || 0} संदेश / Messages)</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              सुरक्षित क्लिनिकल रिकॉर्ड
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {selected.messages?.map((m) => (
              <ChatMessage key={m.id || m.content} role={m.role} content={m.content} />
            ))}
          </div>
        </div>

      </div>
    );
  }

  // Filtered List View
  const filtered = consultations.filter((c) => {
    const matchesUrgency = filterUrgency === 'ALL' || (c.urgency && c.urgency.toUpperCase() === filterUrgency);
    const text = `${c.animal?.name || ''} ${c.animal?.species || ''} ${c.summary || ''}`.toLowerCase();
    const matchesSearch = !search.trim() || text.includes(search.toLowerCase());
    return matchesUrgency && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-7 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              परामर्श इतिहास व ट्रायेज रिकॉर्ड • Consultation History
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {consultations.length} सत्र दर्ज
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            पूर्व में की गई सभी स्वास्थ्य जांचें, लक्षण अवलोकन, गंभीरता रेटिंग और डॉक्टर सलाह का पूरा ब्योरा।
          </p>
        </div>

        <Link
          to="/consultation"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 rounded-2xl shadow-md shadow-emerald-600/20 transition-all self-start md:self-auto shrink-0"
        >
          <Sparkles size={16} />
          <span>+ नया परामर्श (Start Consultation)</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="पशु के नाम या लक्षण से खोजें..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600"
          />
        </div>

        {/* Urgency Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'सभी (All)' },
            { id: 'HIGH', label: '🔴 गंभीर (High)' },
            { id: 'MODERATE', label: '🟡 मध्यम (Moderate)' },
            { id: 'LOW', label: '🟢 सामान्य (Low)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterUrgency(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterUrgency === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Consultations List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="कोई परामर्श रिकॉर्ड नहीं मिला"
          description="फ़िल्टर बदलकर देखें अथवा नए पशु के लिए नया परामर्श सत्र शुरू करें।"
          actionText="+ नया परामर्श सत्र शुरू करें"
          onAction={() => window.location.href = '/consultation'}
        />
      ) : (
        <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-xs overflow-hidden divide-y divide-slate-100">
          {filtered.map((c) => {
            const speciesKey = c.animal?.species?.toLowerCase() || '';
            const emoji = SPECIES_ICONS[speciesKey] || '🐾';

            return (
              <Link
                key={c.id}
                to={`/history/${c.id}`}
                className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-2xl flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    {emoji}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors font-heading">
                        {c.animal?.name || 'अज्ञात पशु'}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        ({c.animal?.species} {c.animal?.breed ? `• ${c.animal.breed}` : ''})
                      </span>
                      <UrgencyBadge urgency={c.urgency || 'LOW'} size="sm" />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 max-w-2xl line-clamp-1 font-medium">
                      {c.summary || 'परामर्श सत्र प्रारंभ किया गया।'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>दर्ज: {new Date(c.created_at).toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 group-hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1">
                    <span>पूरा संवाद देखें (View Transcript)</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
