import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnimals, createConsultation, sendMessage, analyzeImage } from '../services/api';
import ChatMessage from '../components/ChatMessage';
import ImageUploader from '../components/ImageUploader';
import UrgencyBadge from '../components/UrgencyBadge';
import { 
  Send, 
  Loader2, 
  Zap, 
  PawPrint, 
  FileText, 
  Camera, 
  Stethoscope, 
  Sparkles,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  Calendar,
  Weight
} from 'lucide-react';

const DEMO_MESSAGE = 'पशु कल शाम से चारा नहीं खा रहा है, सुस्त बैठा है और जुगाली (chewing cud) बंद है।';

const QUICK_PROMPTS = [
  { labelHi: '🌾 चारा नहीं खा रही (Off-feed)', query: 'पशु कल से चारा नहीं खा रहा है और काफी सुस्त लग रहा है।' },
  { labelHi: '💧 दस्त व कमजोरी (Diarrhea)', query: 'पशु को पतले दस्त हो रहे हैं और खड़े होने में कमजोरी लग रही है।' },
  { labelHi: '🌡️ बुखार व कांपना (Fever)', query: 'पशु के कान गर्म हैं, हल्का कांप रहा है और तापमान तेज लग रहा है।' },
  { labelHi: '🥛 दूध में अचानक कमी (Milk drop)', query: 'दुधारू पशु के दूध में आज अचानक भारी गिरावट आई है और थन थोड़े सख्त हैं।' },
  { labelHi: '💨 पेट फूलना / अफरा (Bloat)', query: 'पशु की बाईं कोख में गैस भरी है, पेट फूला हुआ है और बेचैनी से पैर पटक रहा है।' },
  { labelHi: '🦵 पैर में लंगड़ापन (Limping)', query: 'पशु चलने में लंगड़ा रहा है और खुर में दर्द या सूजन प्रतीत हो रही है।' },
  { labelHi: '🤢 उल्टी व पानी न पीना (Vomiting)', query: 'Animal is continuously vomiting, refusing water, and appearing very weak.' },
];

const SPECIES_ICONS = {
  cow: '🐄',
  buffalo: '🐃',
  goat: '🐐',
  dog: '🐕',
  cat: '🐈',
  poultry: '🐓',
};

export default function Consultation() {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const [animals, setAnimals] = useState([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [urgency, setUrgency] = useState('');
  const [error, setError] = useState('');

  // Image analysis
  const [imageFile, setImageFile] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);

  useEffect(() => {
    getAnimals().then((data) => {
      setAnimals(data);
      if (data.length > 0 && !selectedAnimalId) {
        setSelectedAnimalId(String(data[0].id));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function startConsultation() {
    if (!selectedAnimalId) return;
    setError('');
    try {
      const c = await createConsultation(Number(selectedAnimalId));
      setConsultation(c);
      setMessages([]);
      setUrgency('');
      setImageResult('');
      setImageFile(null);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleSend(text) {
    const msg = text || input.trim();
    if (!msg || !consultation) return;
    setInput('');
    setError('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setSending(true);
    try {
      const res = await sendMessage(consultation.id, msg);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
      if (res.urgency) setUrgency(res.urgency);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  async function handleImageAnalyze(file) {
    setImageLoading(true);
    setError('');
    try {
      const res = await analyzeImage(file);
      setImageResult(res.observation);
    } catch (e) {
      setError(e.message);
    } finally {
      setImageLoading(false);
    }
  }

  async function handleDemo() {
    let demoAnimalId = '';
    const cow = animals.find((a) => a.species.toLowerCase() === 'cow');
    if (cow) {
      demoAnimalId = cow.id;
    } else if (animals.length > 0) {
      demoAnimalId = animals[0].id;
    }

    if (!demoAnimalId) {
      setError('कृपया पहले एक पशु प्रोफाइल जोड़ें / Please create an animal profile first.');
      return;
    }

    setSelectedAnimalId(String(demoAnimalId));
    setError('');
    try {
      const c = await createConsultation(Number(demoAnimalId));
      setConsultation(c);
      setMessages([]);
      setUrgency('');
      setImageResult('');
      setImageFile(null);

      // Send demo message
      setMessages([{ role: 'user', content: DEMO_MESSAGE }]);
      setSending(true);
      const res = await sendMessage(c.id, DEMO_MESSAGE);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
      if (res.urgency) setUrgency(res.urgency);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  const selectedAnimal = animals.find((a) => String(a.id) === String(selectedAnimalId));
  const speciesKey = selectedAnimal?.species?.toLowerCase() || '';
  const selectedEmoji = SPECIES_ICONS[speciesKey] || '🐾';

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
            <Stethoscope size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
                AI पशु स्वास्थ्य परामर्श • Healthcare Assistant
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              अपनी भाषा (हिंदी / Hinglish / English) में लक्षण बताएं और तुरंत क्लिनिकल सलाह पाएं
            </p>
          </div>
        </div>

        {urgency && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <UrgencyBadge urgency={urgency} />
          </div>
        )}
      </div>

      {/* Step 1: Select Animal (if no consultation is active) */}
      {!consultation && (
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              चरण 1 / STEP 1
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading mt-2">
              जांच के लिए पशु का चयन करें / Select Animal
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              नीचे दी गई सूची में से अपना पशु चुनें अथवा 'डेमो केस' चलाकर देखें:
            </p>
          </div>

          {animals.length === 0 ? (
            <div className="p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-4">
              <PawPrint size={36} className="mx-auto text-slate-400" />
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-800">अभी कोई पशु पंजीकृत नहीं है</p>
                <p className="text-xs text-slate-500">परामर्श शुरू करने से पहले अपने पशु का नाम व नस्ल दर्ज करें।</p>
              </div>
              <button
                onClick={() => navigate('/animals')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
              >
                + नया पशु जोड़ें / Add Animal
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Dropdown Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  पशु चुनें (Select Registered Animal):
                </label>
                <select
                  value={selectedAnimalId}
                  onChange={(e) => setSelectedAnimalId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 transition-all cursor-pointer"
                >
                  {animals.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.species} {a.breed ? `(${a.breed})` : ''} • उम्र: {a.age || 'N/A'} • वजन: {a.weight ? `${a.weight} kg` : 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Animal Preview Card */}
              {selectedAnimal && (
                <div className="p-5 bg-emerald-50/70 border-2 border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-300 text-2xl flex items-center justify-center shadow-2xs shrink-0">
                      {selectedEmoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-emerald-950 font-heading">
                          {selectedAnimal.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800 border border-emerald-300">
                          {selectedAnimal.species}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 font-medium mt-0.5">
                        {selectedAnimal.breed ? `नस्ल: ${selectedAnimal.breed} • ` : ''}
                        {selectedAnimal.age ? `उम्र: ${selectedAnimal.age} • ` : ''}
                        {selectedAnimal.weight ? `वजन: ${selectedAnimal.weight} kg` : ''}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
                    ✓ प्रोफाइल चयनित (Ready)
                  </span>
                </div>
              )}

              {/* Action Buttons: Clean spacing, NO OVERLAPPING */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={startConsultation}
                  disabled={!selectedAnimalId}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 rounded-2xl shadow-md shadow-emerald-600/25 hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>परामर्श सत्र शुरू करें / Start Session</span>
                </button>

                <button
                  onClick={handleDemo}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 rounded-2xl transition-colors cursor-pointer"
                >
                  <Zap size={16} className="text-amber-600" />
                  <span>उदाहरण केस देखें / Try Demo Case</span>
                </button>
              </div>

            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2 font-medium">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Active Chat Consultation Interface */}
      {consultation && (
        <div className="space-y-5">
          
          {/* Active Session Info Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base">
                {selectedEmoji}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900 font-heading">
                    {consultation.animal?.name}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    ({consultation.animal?.species} {consultation.animal?.breed ? `• ${consultation.animal.breed}` : ''})
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    सत्र #{consultation.id}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  उम्र: {consultation.animal?.age || 'N/A'} {consultation.animal?.weight ? `• वजन: ${consultation.animal.weight} kg` : ''}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowImageUpload(!showImageUpload)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                  showImageUpload
                    ? 'bg-purple-100 text-purple-900 border-purple-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Camera size={14} className="text-purple-600" />
                <span>{showImageUpload ? 'फोटो टूल बंद करें' : 'फोटो अपलोड करें'}</span>
              </button>

              <button
                onClick={() => { setConsultation(null); setMessages([]); setUrgency(''); }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Reset or Switch Animal"
              >
                <RotateCcw size={13} />
                <span>पशु बदलें / Reset</span>
              </button>
            </div>
          </div>

          {/* Optional Computer Vision Photo Box (Toggleable drawer) */}
          {showImageUpload && (
            <div className="bg-white border-2 border-purple-200 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-purple-950 font-heading">
                  <Camera size={18} className="text-purple-600" />
                  <span>कंप्यूटर विज़न फ़ोटो परीक्षण (Computer Vision Photo Inspection)</span>
                </div>
                <button
                  onClick={() => setShowImageUpload(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  छिपाएं (Hide)
                </button>
              </div>

              <ImageUploader
                file={imageFile}
                setFile={setImageFile}
                onAnalyze={handleImageAnalyze}
                loading={imageLoading}
              />

              {imageResult && (
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                    <ShieldCheck size={16} className="text-purple-700" />
                    <span>फ़ोटो विश्लेषण परिणाम (OpenCV Visual Features)</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans pl-5">
                    {imageResult}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat Messages Box */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 min-h-[380px] max-h-[560px] overflow-y-auto space-y-5 shadow-xs">
            {messages.length === 0 && !sending && (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-2xs">
                  <MessageSquare size={28} />
                </div>
                <div className="space-y-1 max-w-lg mx-auto">
                  <h3 className="text-base font-extrabold text-slate-900 font-heading">
                    पशु के लक्षणों का वर्णन करें
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    आप <strong>हिंदी, Hinglish, या English</strong> में लिख सकते हैं (जैसे: <em>"गाय ने कल से चारा नहीं खाया"</em> या <em>"Dog is vomiting and dull"</em>).
                  </p>
                </div>

                {/* Quick Prompts Chips */}
                <div className="pt-2 max-w-2xl mx-auto space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    त्वरित लक्षण चुनें (Click to Ask Quick Symptoms):
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt.labelHi}
                        onClick={() => handleSend(prompt.query)}
                        className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:scale-102"
                      >
                        {prompt.labelHi}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <ChatMessage key={i} role={m.role} content={m.content} />
            ))}

            {sending && (
              <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-emerald-900 bg-emerald-50/90 border border-emerald-300 p-4 rounded-2xl max-w-md shadow-xs animate-pulse">
                <Loader2 size={18} className="animate-spin text-emerald-600 shrink-0" />
                <span>पशु चिकित्सा डेटाबेस से मिलान व लक्षणों की जांच की जा रही है...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Symptoms Bar above input (when chat is already active) */}
          {messages.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-slate-500 shrink-0">सुझाव:</span>
              {QUICK_PROMPTS.slice(0, 4).map((p) => (
                <button
                  key={p.labelHi}
                  onClick={() => handleSend(p.query)}
                  disabled={sending}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-semibold whitespace-nowrap cursor-pointer"
                >
                  {p.labelHi}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2.5 bg-white p-2.5 rounded-2xl border-2 border-slate-300 focus-within:border-emerald-500 shadow-xs"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="पशु के लक्षण बताएं (हिंदी, Hinglish या English में लिखें)..."
              disabled={sending}
              className="flex-1 px-4 py-3 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 font-medium"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              aria-label="Send"
            >
              <span>भेजें</span>
              <Send size={16} />
            </button>
          </form>

          {error && (
            <div className="p-4 bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2 font-medium">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Action: Generate Case Summary Report */}
          {messages.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 p-5 bg-emerald-50/70 border border-emerald-200 rounded-3xl">
              <div>
                <p className="text-sm font-bold text-emerald-950 font-heading">
                  परामर्श पूर्ण होने पर डॉक्टर रिपोर्ट प्राप्त करें
                </p>
                <p className="text-xs text-emerald-800 font-medium">
                  यह रिपोर्ट आप पशु चिकित्सक (Veterinary Doctor) को प्रिंट करके दिखा सकते हैं।
                </p>
              </div>

              <button
                onClick={() => navigate(`/case-summary/${consultation.id}`)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-extrabold text-slate-900 bg-white hover:bg-slate-50 border-2 border-emerald-400 rounded-2xl shadow-xs transition-all cursor-pointer shrink-0"
              >
                <FileText size={16} className="text-emerald-700" />
                <span>क्लिनिकल केस समरी बनाएं / View Doctor Report</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
