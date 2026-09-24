import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { generateCaseSummary, getConsultation } from '../services/api';
import { Loader2, ArrowLeft, Printer, Activity, ShieldCheck, Download, Copy, Check, HeartPulse, Stethoscope, FileText } from 'lucide-react';
import UrgencyBadge from '../components/UrgencyBadge';

const SPECIES_ICONS = {
  cow: '🐄',
  buffalo: '🐃',
  goat: '🐐',
  dog: '🐕',
  cat: '🐈',
  poultry: '🐓',
};

export default function CaseSummary() {
  const { id } = useParams();
  const [summary, setSummary] = useState('');
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [c, s] = await Promise.all([
          getConsultation(id),
          generateCaseSummary(Number(id)),
        ]);
        setConsultation(c);
        setSummary(s.summary);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function handleCopy() {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={34} className="animate-spin text-emerald-600" />
        <p className="text-sm font-bold text-slate-800">क्लिनिकल केस समरी तैयार हो रही है...</p>
        <p className="text-xs text-slate-500">पशु रिकॉर्ड, लक्षण विश्लेषण व ट्रायेज रिपोर्ट तैयार की जा रही है।</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/history" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft size={14} /> <span>← इतिहास पर वापस जाएं (Back to History)</span>
        </Link>
        <div className="p-5 bg-rose-50 border-2 border-rose-200 text-rose-900 text-sm font-semibold rounded-2xl">
          केस समरी तैयार नहीं की जा सकी: {error}
        </div>
      </div>
    );
  }

  const speciesKey = consultation?.animal?.species?.toLowerCase() || '';
  const emoji = SPECIES_ICONS[speciesKey] || '🐾';

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-6">
      
      {/* Top action bar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to={`/history/${id}`}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft size={15} /> <span>← परामर्श संवाद पर वापस जाएं (Back to Transcript)</span>
        </Link>
        
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'कॉपी हो गई (Copied!)' : 'टेक्स्ट कॉपी करें (Copy Text)'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Printer size={15} />
            <span>प्रिंट या PDF सेव करें / Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Clinical Sheet */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0 space-y-6">
        
        {/* Document Header */}
        <div className="border-b-2 border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20 shrink-0">
              <HeartPulse size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  PashuCare – AI Animal Healthcare Assistant • केस सारांश
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                AI Animal Healthcare Assistant • Case Summary Record
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="inline-block text-xs font-mono font-bold text-slate-500 uppercase bg-slate-100 px-2.5 py-1 rounded-lg">
              DOC REF #{consultation?.id}-REPORT
            </span>
            <div className="flex sm:justify-end pt-1">
              <UrgencyBadge urgency={consultation?.urgency || 'MODERATE'} />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              तैयार दिनांक: {new Date().toLocaleDateString('hi-IN')} ({new Date().toLocaleDateString()})
            </p>
          </div>
        </div>

        {/* Animal Details Strip */}
        {consultation?.animal && (
          <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wide">
              <span>{emoji}</span>
              <span>पशु रोगी विवरण (Patient Profile)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
              <div>
                <span className="block text-[11px] uppercase font-bold text-slate-500">पशु का नाम (Name)</span>
                <span className="font-extrabold text-slate-900 text-base">{consultation.animal.name}</span>
              </div>
              <div>
                <span className="block text-[11px] uppercase font-bold text-slate-500">प्रजाति व नस्ल (Species / Breed)</span>
                <span className="font-bold text-slate-800">{consultation.animal.species} ({consultation.animal.breed || 'N/A'})</span>
              </div>
              <div>
                <span className="block text-[11px] uppercase font-bold text-slate-500">उम्र व लिंग (Age / Gender)</span>
                <span className="font-bold text-slate-800">{consultation.animal.age || '—'} / {consultation.animal.gender || '—'}</span>
              </div>
              <div>
                <span className="block text-[11px] uppercase font-bold text-slate-500">दर्ज वजन (Weight)</span>
                <span className="font-bold text-slate-800">{consultation.animal.weight ? `${consultation.animal.weight} kg` : 'अदर्ज'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Structured Case Summary Body */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100">
            <FileText size={18} className="text-emerald-600" />
            <span>क्लिनिकल अवलोकन एवं ट्रायेज विवरण (Clinical Findings & Recommendations):</span>
          </div>

          <div className="text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans bg-white p-2 space-y-3">
            {formatSummary(summary)}
          </div>
        </div>

        {/* Doctor Signature & Prescription Box for Print */}
        <div className="mt-8 pt-6 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-900 block">पशु चिकित्सक परीक्षण टिप्पणी (Veterinarian Clinical Notes):</span>
            <div className="h-16 border-b border-dashed border-slate-300"></div>
            <div className="h-6 border-b border-dashed border-slate-300"></div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">पशु चिकित्सक हस्ताक्षर एवं मुहर (Doctor Signature & Seal):</span>
              <p className="text-[11px] text-slate-500">जांच उपरांत हस्ताक्षर करें</p>
            </div>
            <div className="pt-8 flex justify-between items-end border-t border-slate-200 text-[11px] text-slate-500">
              <span>दिनांक / Date: ____________</span>
              <span>हस्ताक्षर / Sign: ____________</span>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border text-xs text-slate-600 leading-relaxed font-medium">
          <ShieldCheck size={20} className="text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong>वैधानिक सूचना (Veterinary Notice):</strong> यह रिपोर्ट PashuCare AI द्वारा शैक्षणिक एवं प्राथमिक सूचनात्मक सहयोग हेतु तैयार की गई है। यह कोई कानूनी रूप से बाध्यकारी डॉक्टर पर्ची नहीं है। कृपया पशु के शारीरिक परीक्षण के समय यह रिपोर्ट अपने प्रमाणित पशु चिकित्सक को दिखाएं।
          </div>
        </div>

      </div>

    </div>
  );
}

function formatSummary(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-black text-slate-900 text-sm">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
