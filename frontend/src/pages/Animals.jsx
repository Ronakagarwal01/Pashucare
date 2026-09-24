import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAnimal, getAnimals } from '../services/api';
import { 
  Plus, 
  Loader2, 
  PawPrint, 
  X, 
  MessageSquarePlus, 
  Sparkles,
  Calendar,
  Weight,
  Tag,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import EmptyState from '../components/EmptyState';

const SPECIES_OPTIONS = [
  { value: 'Cow', labelHi: 'गाय (Cow)' },
  { value: 'Buffalo', labelHi: 'भैंस (Buffalo)' },
  { value: 'Goat', labelHi: 'बकरी (Goat)' },
  { value: 'Dog', labelHi: 'कुत्ता (Dog)' },
  { value: 'Cat', labelHi: 'बिल्ली (Cat)' },
  { value: 'Poultry', labelHi: 'मुर्गी (Poultry)' },
];

const GENDER_OPTIONS = [
  { value: 'Female', labelHi: 'मादा (Female)' },
  { value: 'Male', labelHi: 'नर (Male)' },
];

const SPECIES_EMOJIS = {
  cow: '🐄',
  buffalo: '🐃',
  goat: '🐐',
  dog: '🐕',
  cat: '🐈',
  poultry: '🐓',
};

const EMPTY = { name: '', species: '', breed: '', age: '', gender: '', weight: '', notes: '' };

export default function Animals() {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedSpeciesFilter, setSelectedSpeciesFilter] = useState('ALL');

  function loadAnimals() {
    getAnimals()
      .then(setAnimals)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadAnimals, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.species) return;
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, weight: form.weight ? parseFloat(form.weight) : null };
      await createAnimal(payload);
      setForm(EMPTY);
      setShowForm(false);
      loadAnimals();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const filteredAnimals = animals.filter((a) => {
    const matchesSpecies = selectedSpeciesFilter === 'ALL' || (a.species && a.species.toLowerCase() === selectedSpeciesFilter.toLowerCase());
    const matchesSearch = !search.trim() || `${a.name} ${a.species} ${a.breed || ''} ${a.notes || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchesSpecies && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
        <p className="text-sm font-bold text-slate-700">पशु प्रोफाइल लोड हो रहे हैं / Loading Animal Profiles...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-7 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              पशु स्वास्थ्य प्रोफाइल • Animal Profiles
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {animals.length} पंजीकृत पशु
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            अपने मवेशियों, डेयरी पशुओं व पालतू जानवरों का वजन, नस्ल, उम्र और मेडिकल रिकॉर्ड सुरक्षित रखें।
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 rounded-2xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all cursor-pointer self-start md:self-auto shrink-0"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          <span>{showForm ? 'फॉर्म बंद करें (Cancel)' : '+ नया पशु जोड़ें (Register Animal)'}</span>
        </button>
      </div>

      {/* Creation Form Modal/Card */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                नया पशु पंजीकरण • REGISTRATION
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading mt-1">
                पशु का विवरण दर्ज करें / Animal Details
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                सटीक उम्र, नस्ल और वजन दर्ज करने से AI ट्रायेज परामर्श अधिक सटीक परिणाम देता है।
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                पशु का नाम या टैग नंबर (Name / ID) *
              </label>
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="उदा. गौरी (Gauri) या टैग #104"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600"
                required
              />
            </div>

            {/* Species */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                प्रजाति (Species) *
              </label>
              <select
                value={form.species}
                onChange={(e) => updateField('species', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 cursor-pointer"
                required
              >
                <option value="">प्रजाति चुनें...</option>
                {SPECIES_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.labelHi}</option>
                ))}
              </select>
            </div>

            {/* Breed */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                नस्ल (Breed)
              </label>
              <input
                value={form.breed}
                onChange={(e) => updateField('breed', e.target.value)}
                placeholder="उदा. गिर (Gir), मुर्रा (Murrah), बीतल"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600"
              />
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                उम्र (Age)
              </label>
              <input
                value={form.age}
                onChange={(e) => updateField('age', e.target.value)}
                placeholder="उदा. 4 वर्ष (4 years) या 6 माह"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                लिंग (Gender)
              </label>
              <select
                value={form.gender}
                onChange={(e) => updateField('gender', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 cursor-pointer"
              >
                <option value="">लिंग चुनें...</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>{g.labelHi}</option>
                ))}
              </select>
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                वजन कि.ग्रा. में (Estimated Weight kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => updateField('weight', e.target.value)}
                placeholder="उदा. 380 (kg)"
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2 lg:col-span-3 space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                स्वास्थ्य इतिहास व विशेष टिप्पणी (Medical Notes & Health History)
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="टीकाकरण (Vaccination status), दुधारू अवस्था (Lactation), कोई पुरानी बीमारी या आदतें..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600"
              />
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'सुरक्षित हो रहा है...' : 'सुरक्षित करें (Save Animal Profile)'}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="नाम या नस्ल से खोजें (Search animal)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600"
          />
        </div>

        {/* Species Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'सभी (All)' },
            { id: 'Cow', label: '🐄 गाय' },
            { id: 'Buffalo', label: '🐃 भैंस' },
            { id: 'Goat', label: '🐐 बकरी' },
            { id: 'Dog', label: '🐕 कुत्ता' },
            { id: 'Poultry', label: '🐓 मुर्गी' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSpeciesFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedSpeciesFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Animal Cards Grid */}
      {filteredAnimals.length === 0 ? (
        <EmptyState
          icon={PawPrint}
          title="कोई पशु नहीं मिला"
          description={search ? "आपकी खोज के अनुसार कोई पशु उपलब्ध नहीं है।" : "पशुओं का स्वास्थ्य रिकॉर्ड रखने के लिए ऊपर '+ नया पशु जोड़ें' पर क्लिक करें।"}
          actionText={!search ? "+ नया पशु जोड़ें" : undefined}
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimals.map((a) => {
            const speciesKey = a.species?.toLowerCase() || '';
            const emoji = SPECIES_EMOJIS[speciesKey] || '🐾';

            return (
              <div
                key={a.id}
                className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-7 card-hover shadow-xs flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  
                  {/* Top Bar with Emoji and Species Tag */}
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl shadow-2xs">
                      {emoji}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-800 border border-slate-200">
                      {a.species}
                    </span>
                  </div>

                  {/* Name and Breed */}
                  <div>
                    <h3 className="text-xl font-black text-slate-900 font-heading">
                      {a.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      {a.breed || 'नस्ल अनिर्दिष्ट (Unassigned)'} {a.gender ? `• ${a.gender === 'Female' ? 'मादा' : 'नर'}` : ''}
                    </p>
                  </div>

                  {/* Physical Metrics Pills */}
                  <div className="flex flex-wrap gap-2 text-xs text-slate-700 font-semibold">
                    {a.age && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
                        <Calendar size={13} className="text-slate-400" />
                        <span>उम्र: {a.age}</span>
                      </span>
                    )}
                    {a.weight && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
                        <Weight size={13} className="text-slate-400" />
                        <span>वजन: {a.weight} kg</span>
                      </span>
                    )}
                  </div>

                  {/* Notes */}
                  {a.notes && (
                    <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 leading-relaxed font-medium">
                      <strong className="text-slate-900 block text-[11px] mb-0.5">नोट्स:</strong>
                      {a.notes}
                    </div>
                  )}

                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    दर्ज: {new Date(a.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => navigate('/consultation')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <MessageSquarePlus size={14} />
                    <span>परामर्श लें (Consultation)</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
