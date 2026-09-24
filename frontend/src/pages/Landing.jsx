import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Languages, 
  BookOpenCheck, 
  AlertTriangle, 
  Camera, 
  PawPrint, 
  FileText, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  ShieldAlert,
  ChevronRight,
  Activity,
  HeartPulse,
  Sparkles,
  Thermometer,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import Navbar from '../components/Navbar';
import UrgencyBadge from '../components/UrgencyBadge';

const STEPS = [
  {
    num: '1',
    badgeEn: 'Step 1',
    badgeHi: 'चरण 1',
    titleEn: 'Select or Register Animal',
    titleHi: 'पशु चुनें या प्रोफाइल बनाएं',
    descEn: 'Select cattle, pet or poultry (Cow, Buffalo, Goat, Dog, Cat, Poultry) with baseline age and weight.',
    descHi: 'अपनी गाय, भैंस, बकरी या पालतू पशु को चुनें अथवा उम्र और वजन के साथ नया प्रोफाइल जोड़ें।',
    icon: PawPrint,
    color: 'bg-emerald-600 text-white shadow-emerald-600/30',
  },
  {
    num: '2',
    badgeEn: 'Step 2',
    badgeHi: 'चरण 2',
    titleEn: 'Describe Symptoms Naturally',
    titleHi: 'अपनी भाषा में लक्षण बताएं',
    descEn: 'Type what you observe in Hindi, Hinglish, or English (e.g. "चारा नहीं खा रही", "susti hai", "vomiting").',
    descHi: 'हिंदी, हिंग्लिश या इंग्लिश में बताएं कि पशु में क्या बदलाव दिखे — जैसे चारा न खाना, बुखार, दस्त या सुस्ती।',
    icon: Stethoscope,
    color: 'bg-teal-600 text-white shadow-teal-600/30',
  },
  {
    num: '3',
    badgeEn: 'Step 3',
    badgeHi: 'चरण 3',
    titleEn: 'Get Immediate Triage & Care Steps',
    titleHi: 'जांच रेटिंग व प्राथमिक सलाह पाएं',
    descEn: 'Receive clinical urgency rating (LOW / MODERATE / HIGH), care guidance, and veterinary next steps.',
    descHi: 'तुरंत गंभीरता स्तर (सामान्य / मध्यम / गंभीर), घर पर देखभाल के उपाय और डॉक्टर से परामर्श की सलाह प्राप्त करें।',
    icon: HeartPulse,
    color: 'bg-emerald-700 text-white shadow-emerald-700/30',
  },
];

const FEATURES = [
  {
    icon: Languages,
    badgeEn: 'Multilingual Support',
    badgeHi: 'हिंदी व हिंग्लिश',
    titleEn: 'Hindi, Hinglish & English Understanding',
    titleHi: 'अपनी सरल बोलचाल की भाषा में बात करें',
    descEn: 'Natural dialogue processing designed for rural farmers and animal owners. Understands terms like "bhookh nahi lag rahi", "susti", "dast", or "bukhar".',
    descHi: 'स्थानीय बोलचाल के शब्द जैसे "चारा छोड़ दिया", "जुगाली नहीं कर रही", "पेट फूलना" आदि आसानी से समझता है।',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  {
    icon: BookOpenCheck,
    badgeEn: 'Veterinary RAG Grounded',
    badgeHi: 'वैज्ञानिक चिकित्सा डेटा',
    titleEn: 'Evidence-Based Veterinary Knowledge',
    titleHi: 'प्रमाणित पशु चिकित्सा ज्ञान पर आधारित',
    descEn: 'Every triage reply is grounded in veterinary clinical guidelines covering digestion, rumination, respiratory illness, and infectious diseases.',
    descHi: 'पशुओं के पाचन तंत्र, जुगाली, बुखार, संक्रामक रोगों व आहार संतुलन के प्रमाणित नियमों पर आधारित सुरक्षित मार्गदर्शन।',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  {
    icon: AlertTriangle,
    badgeEn: 'Urgency Classification',
    badgeHi: 'गंभीरता का स्तर',
    titleEn: 'Immediate Urgency Level (LOW / MOD / HIGH)',
    titleHi: 'गंभीरता का तुरंत आकलन',
    descEn: 'Classifies every case so caretakers instantly know whether home observation suffices or emergency veterinary hospitalization is critical.',
    descHi: '🟢 सामान्य, 🟡 मध्यम, और 🔴 गंभीर आपातकाल का स्पष्ट विभाजन ताकि आपातकाल में समय पर उचित कदम उठाया जा सके।',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  {
    icon: Camera,
    badgeEn: 'Computer Vision',
    badgeHi: 'फ़ोटो परीक्षण',
    titleEn: 'Lesion & Posture Photo Inspection',
    titleHi: 'घाव, आंख व मुद्रा की फ़ोटो जांच',
    descEn: 'Upload clear photos of wounds, eye discharge, or skin irritation for automated feature analysis and preliminary visual documentation.',
    descHi: 'घाव, त्वचा रोग, आंख में लाली या खड़े होने की मुद्रा की फोटो अपलोड करके प्राथमिक विश्लेषण प्राप्त करें।',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
  },
  {
    icon: PawPrint,
    badgeEn: 'Health Profiles',
    badgeHi: 'पशु रिकॉर्ड',
    titleEn: 'Comprehensive Animal Medical History',
    titleHi: 'पशुओं का डिजिटल स्वास्थ्य प्रोफाइल',
    descEn: 'Maintain organized records of baseline weights, lactation status, age, breeds, and past consultation logs across your entire herd.',
    descHi: 'अपनी सभी गायों, भैंसों और पालतू पशुओं के वजन, उम्र, नस्ल और पुरानी बीमारियों का पूरा डिजिटल रिकॉर्ड सुरक्षित रखें।',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
  },
  {
    icon: FileText,
    badgeEn: 'Doctor Report',
    badgeHi: 'डॉक्टर रिपोर्ट',
    titleEn: 'Printable Veterinary Case Summaries',
    titleHi: 'प्रिंट करने योग्य क्लिनिकल रिपोर्ट',
    descEn: 'Generate structured case sheets ready to print or share with your local registered veterinary doctor during physical examination.',
    descHi: 'पशु चिकित्सक (Veterinary Doctor) को दिखाने हेतु व्यवस्थित समरी रिपोर्ट तुरंत तैयार व प्रिंट करें।',
    color: 'text-teal-700 bg-teal-50 border-teal-200',
  },
];

const SPECIES_CARDS = [
  {
    nameEn: 'Cow (गाय)',
    nameHi: 'गोवंश',
    emoji: '🐄',
    temp: 'Normal Temp: 38.0°C – 39.3°C',
    common: ['Rumen bloat (अफरा) & acidosis', 'Reduced milk yield (दूध में कमी)', 'Mastitis (थनैला) & tick fever', 'Fever & respiratory illness (गलघोंटू)'],
  },
  {
    nameEn: 'Buffalo (भैंस)',
    nameHi: 'महिष वर्ग',
    emoji: '🐃',
    temp: 'Normal Temp: 37.5°C – 39.0°C',
    common: ['Indigestion & off-feed (भूख न लगना)', 'Heat stress & panting (हांफना)', 'Post-calving care & prolapse (फूल दिखाना)', 'Joint swelling & lameness (लंगड़ापन)'],
  },
  {
    nameEn: 'Goat (बकरी)',
    nameHi: 'अजा वर्ग',
    emoji: '🐐',
    temp: 'Normal Temp: 38.5°C – 40.0°C',
    common: ['PPR & pneumonia (निमोनिया)', 'Severe enterotoxemia / diarrhea (दस्त)', 'Bottle jaw & worm parasites (कृमि)', 'Bloat & sudden lethargy (सुस्ती)'],
  },
  {
    nameEn: 'Dog (कुत्ता)',
    nameHi: 'श्वान वर्ग',
    emoji: '🐕',
    temp: 'Normal Temp: 38.0°C – 39.2°C',
    common: ['Parvovirus in puppies (उल्टी-दस्त)', 'Acute gastroenteritis & anorexia', 'Tick fever & skin allergies', 'Dehydration & lethargy'],
  },
  {
    nameEn: 'Cat (बिल्ली)',
    nameHi: 'मार्जार वर्ग',
    emoji: '🐈',
    temp: 'Normal Temp: 38.0°C – 39.5°C',
    common: ['Hepatic lipidosis (अचानक खाना छोड़ना)', 'Upper respiratory infection (छींक/आंख बहना)', 'Feline urinary tract issues', 'Hairballs & stomach distress'],
  },
  {
    nameEn: 'Poultry (मुर्गी)',
    nameHi: 'कुक्कुट वर्ग',
    emoji: '🐓',
    temp: 'Normal Temp: 40.5°C – 42.0°C',
    common: ['Sudden drop in egg production', 'Coccidiosis (खूनी दस्त)', 'Respiratory rales / sneezing (घरघराहट)', 'Ruffled feathers & drop in flock feed'],
  },
];

const SAMPLE_SIMULATION_CASES = [
  {
    id: 'cow',
    labelEn: '🐄 Cow: Off-Feed & Bloat',
    labelHi: 'गाय: चारा न खाना व अफरा',
    animal: 'Gauri (Gir Cow, 4 yrs • 385 kg)',
    userQuery: 'Gauri kal sham se chaara nahi kha rahi hai aur pet thoda fula lag raha hai. Jugaali bhi nahi kar rahi.',
    urgency: 'MODERATE',
    obs: 'गाय में 24 घंटे से चारा न खाना, जुगाली बंद होना और पेट फूलने के लक्षण दिखे हैं (Reduced rumination & mild tympany).',
    guidance: 'पानी की उपलब्धता रखें लेकिन सूखा या भारी दाना तुरंत बंद करें। बाईं कोख में गैस या तनाव की जांच करें।',
    nextStep: 'अगले 12 घंटे में सुधार न दिखे या सांस लेने में परेशानी हो तो तुरंत नजदीकी पशु चिकित्सक (Veterinary Doctor) को बुलाएं।',
  },
  {
    id: 'dog',
    labelEn: '🐕 Dog: Severe Vomiting',
    labelHi: 'कुत्ता: उल्टी और बुखार',
    animal: 'Sheru (Labrador, 3 yrs • 29 kg)',
    userQuery: 'Sheru has vomited 4 times since morning, shivering with mild fever, and refusing any food or water.',
    urgency: 'HIGH',
    obs: 'Multiple bouts of acute vomiting accompanied by fever and complete water refusal indicates dehydration risk.',
    guidance: 'Do not administer oral human medications. Keep him calm and warm. Check gum color (should be pink, not pale).',
    nextStep: 'Take to a veterinary emergency clinic today. Intravenous fluids (IV) and antiemetic therapy may be urgently required.',
  },
  {
    id: 'goat',
    labelEn: '🐐 Goat: Diarrhea',
    labelHi: 'बकरी: दस्त व कमजोरी',
    animal: 'Munni (Beetal Goat, 2 yrs • 34 kg)',
    userQuery: 'Bakri ko patle dast ho rahe hain aur thoda sust hokar baithi hai. Aankhon ke neeche safedi dikh rahi hai.',
    urgency: 'MODERATE',
    obs: 'बकरी में पतले दस्त और आंखों के नीचे पीलापन/सफेदी (Pale conjunctiva) कृमि संक्रमण या आंत्रशोथ की ओर संकेत करता है।',
    guidance: 'ओआरएस (ORS) या इलेक्ट्रोलाइट घोल पिलाएं ताकि पानी की कमी न हो। सूखा व साफ चारा दें।',
    nextStep: 'पशु चिकित्सक से डीवॉर्मिंग (Deworming) और उपयुक्त एंटीबायोटिक की खुराक लिखवाएं।',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [activeSim, setActiveSim] = useState(SAMPLE_SIMULATION_CASES[0]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Navigation Bar */}
      <Navbar />

      {/* ======================================================================= */}
      {/* 1. HERO SECTION (Full-Width, Centered, High-Impact & Bilingual)        */}
      {/* ======================================================================= */}
      <section className="relative overflow-hidden hero-glow pt-12 pb-16 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-6xl mx-auto w-full text-center space-y-8">
          
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-300 text-xs sm:text-sm font-extrabold text-emerald-800 shadow-xs">
            <Sparkles size={16} className="text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span>PashuCare – AI Animal Healthcare Assistant</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight font-heading">
              पशु के लक्षण समझें और{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                सही समय पर सही कदम उठाएं
              </span>
            </h1>
            
            <p className="text-base sm:text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed font-medium">
              अपनी सरल भाषा <strong>(हिंदी, Hinglish, या English)</strong> में लक्षण बताएं। तत्काल आपातकाल रेटिंग (सामान्य / मध्यम / गंभीर), पशु चिकित्सा ज्ञान पर आधारित प्राथमिक देखभाल और डॉक्टर रिपोर्ट प्राप्त करें।
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 max-w-xl mx-auto">
            <Link
              to="/consultation"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-xl transition-all cursor-pointer"
            >
              <Stethoscope size={22} />
              <span>AI परामर्श शुरू करें / Start Consultation</span>
              <ArrowRight size={20} />
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-base rounded-2xl border-2 border-slate-300 shadow-xs transition-colors"
            >
              <span>डैशबोर्ड देखें / Dashboard</span>
              <ChevronRight size={18} className="text-slate-500" />
            </Link>
          </div>

          {/* Trust Highlights Strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-700 font-bold">
            <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>गाय, भैंस, बकरी, कुत्ता व मुर्गी</span>
            </span>
            <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>हिंदी • English • Hinglish सपोर्ट</span>
            </span>
            <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>स्पष्ट स्तर (सामान्य / मध्यम / गंभीर)</span>
            </span>
          </div>

          {/* ======================================================================= */}
          {/* Interactive Live Triage Simulator Card                                */}
          {/* ======================================================================= */}
          <div className="pt-10 max-w-4xl mx-auto w-full text-left">
            <div className="bg-white border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                      LIVE PREVIEW DEMO
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-heading">
                      प्रत्यक्ष परामर्श सिमुलेटर (Interactive Simulator)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    नीचे दिए गए किसी भी उदाहरण पर क्लिक करें और देखें कि PashuCare AI कैसे जांच करता है:
                  </p>
                </div>

                {/* Case Selector Tabs */}
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_SIMULATION_CASES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveSim(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeSim.id === c.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {c.labelHi}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Simulation Display */}
              <div className="space-y-4">
                
                {/* Meta details */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <PawPrint size={15} className="text-emerald-600" />
                    <span>पशु प्रोफाइल: {activeSim.animal}</span>
                  </div>
                  <UrgencyBadge urgency={activeSim.urgency} size="sm" />
                </div>

                {/* User Input bubble */}
                <div className="p-4 bg-slate-100 rounded-2xl text-xs sm:text-sm text-slate-900 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <Stethoscope size={13} />
                    <span>पशुपालक द्वारा बताए गए लक्षण (Farmer's Query):</span>
                  </div>
                  <p className="font-semibold text-slate-900 pl-4">
                    "{activeSim.userQuery}"
                  </p>
                </div>

                {/* AI Triage Structured Response */}
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 space-y-3 text-xs sm:text-sm">
                  
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 pb-2 border-b border-emerald-100">
                    <Sparkles size={16} />
                    <span>PASHUCARE – AI ANIMAL HEALTHCARE ASSISTANT:</span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <strong className="text-slate-900 font-bold block text-xs">📋 लक्षण अवलोकन (Observations):</strong>
                      <p className="text-slate-700">{activeSim.obs}</p>
                    </div>

                    <div>
                      <strong className="text-emerald-900 font-bold block text-xs">🛡️ प्राथमिक उपाय (Care Guidance):</strong>
                      <p className="text-slate-700">{activeSim.guidance}</p>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 font-semibold">
                      <strong className="text-amber-900 font-bold block text-xs mb-0.5">🚨 अगला कदम (Next Step):</strong>
                      {activeSim.nextStep}
                    </div>
                  </div>

                </div>

                {/* Footer Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-slate-600 font-medium">
                    क्या आपके पशु में भी कोई समस्या है?
                  </span>
                  <button
                    onClick={() => navigate('/consultation')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Zap size={15} />
                    <span>लाइव परामर्श शुरू करें / Start Consultation</span>
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ======================================================================= */}
      {/* 2. HOW IT WORKS (3 Simple Clear Steps)                                 */}
      {/* ======================================================================= */}
      <section className="py-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto w-full space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              सरल कार्यप्रणाली • WORKFLOW
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
              PashuCare AI 3 आसान चरणों में काम करता है
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              किसानों, पशुपालकों और पेट्स मालिकों के लिए विशेष रूप से डिज़ाइन किया गया सहज इंटरफ़ेस।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-emerald-500 hover:shadow-md transition-all"
                >
                  <div className="space-y-4">
                    
                    <div className="flex items-center justify-between">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${step.color}`}>
                        <Icon size={26} />
                      </div>
                      <span className="text-4xl font-black text-slate-300 font-heading">
                        #{step.num}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wide">
                        {step.badgeHi} • {step.badgeEn}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 font-heading">
                        {step.titleHi}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500">
                        {step.titleEn}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {step.descHi}
                    </p>

                  </div>

                  <div className="pt-4 border-t border-slate-200 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>तुरंत व सुरक्षित सहायता</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ======================================================================= */}
      {/* 3. CAPABILITIES / FEATURES                                              */}
      {/* ======================================================================= */}
      <section className="py-20 bg-slate-50 border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto w-full space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              मुख्य सुविधाएं • KEY FEATURES
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
              पशुओं की बेहतर देखभाल के लिए आधुनिक तकनीक
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              घर बैठे पशु के स्वास्थ्य की निगरानी, लक्षणों का मूल्यांकन और डॉक्टर रिपोर्ट की सुविधा।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.titleEn}
                  className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${feat.color}`}>
                        <Icon size={24} />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {feat.badgeHi}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-heading">
                        {feat.titleHi}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{feat.titleEn}</p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                      {feat.descHi}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ======================================================================= */}
      {/* 4. SUPPORTED SPECIES DATABASE                                           */}
      {/* ======================================================================= */}
      <section className="py-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto w-full space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
              समर्थित पशु • SPECIES DATABASE
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
              डेयरी पशु, छोटे मवेशी व पालतू जानवर
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              प्रत्येक प्रजाति के सामान्य तापमान, पाचन क्रिया और प्रमुख रोगों के संदर्भ पहले से शामिल हैं।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPECIES_CARDS.map((sp) => (
              <div
                key={sp.nameEn}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-6 hover:bg-white hover:border-emerald-400 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-3xl flex items-center justify-center shadow-xs shrink-0">
                    {sp.emoji}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 font-heading">
                      {sp.nameEn}
                    </h3>
                    <p className="text-xs text-emerald-700 font-bold">{sp.temp}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">प्रमुख सामान्य समस्याएं:</p>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                    {sp.common.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================================= */}
      {/* 5. VETERINARY SAFETY & EMERGENCY NOTICE                                 */}
      {/* ======================================================================= */}
      <section className="py-16 bg-amber-50/70 border-b border-amber-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25">
              <ShieldAlert size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                महत्वपूर्ण पशु चिकित्सा सूचना एवं सुरक्षा नियम (Veterinary Notice)
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                PashuCare AI एक निर्णय-समर्थन व सूचनात्मक सहायक है जो पशुपालकों को लक्षण समझने और प्राथमिक देखभाल में मदद करता है। यह <strong>प्रमाणित पशु चिकित्सक (Veterinary Doctor) का विकल्प नहीं है</strong> और न ही कोई दवा की पर्ची जारी करता है। यदि पशु में खून बहना, गंभीर सांस की तकलीफ, अत्यधिक अफरा या उठने में असमर्थता दिखे, तो बिना देर किए तुरंत नजदीकी पशु अस्पताल ले जाएं।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================= */}
      {/* 6. FOOTER                                                               */}
      {/* ======================================================================= */}
      <footer className="mt-auto py-12 bg-slate-900 text-slate-400 text-xs border-t border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-white font-extrabold text-sm font-heading">PashuCare.AI</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-400 text-[10px] font-bold border border-emerald-700">
                पशु स्वास्थ्य सहायक
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              PashuCare – AI Animal Healthcare Assistant
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-semibold text-slate-300">
            <Link to="/consultation" className="hover:text-emerald-400 transition-colors">परामर्श लें (Consultation)</Link>
            <Link to="/dashboard" className="hover:text-emerald-400 transition-colors">डैशबोर्ड (Dashboard)</Link>
            <Link to="/animals" className="hover:text-emerald-400 transition-colors">पशु सूची (Animals)</Link>
            <Link to="/history" className="hover:text-emerald-400 transition-colors">इतिहास (History)</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
