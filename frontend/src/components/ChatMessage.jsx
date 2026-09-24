import { Stethoscope, User, AlertCircle, Eye, Info, CheckCircle2, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import UrgencyBadge from './UrgencyBadge';

export default function ChatMessage({ role, content }) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 items-end">
        <div className="max-w-[90%] sm:max-w-[80%] px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl rounded-br-xs shadow-md font-medium text-sm leading-relaxed whitespace-pre-wrap">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-100/90 mb-1 flex items-center gap-1.5">
            <User size={13} />
            <span>आपकी जानकारी / Your Input</span>
          </div>
          <div>{content}</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 text-xs shadow-xs mb-1">
          <User size={16} />
        </div>
      </div>
    );
  }

  // Parse structured sections if assistant response contains standard triage keys
  const sections = parseTriageMessage(content);

  return (
    <div className="flex justify-start gap-3 items-start">
      <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 mt-1">
        <Stethoscope size={18} />
      </div>

      <div className="max-w-[92%] sm:max-w-[84%] bg-white border border-slate-200/90 text-slate-900 rounded-3xl rounded-tl-xs shadow-sm overflow-hidden divide-y divide-slate-100">
        
        {/* Header Bar */}
        <div className="px-5 py-3 bg-slate-50/90 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black tracking-tight text-slate-900 font-heading">
              PashuCare AI • क्लिनिकल परामर्श
            </span>
          </div>
          {sections.urgency && (
            <UrgencyBadge urgency={sections.urgency} size="sm" />
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs sm:text-sm leading-relaxed">
          {sections.isStructured ? (
            <>
              {/* Observations */}
              {sections.observations && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                    <Eye size={15} className="text-emerald-600" />
                    <span>लक्षण व अवलोकन (Reported Observations)</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed pl-5">
                    {sections.observations}
                  </p>
                </div>
              )}

              {/* Information */}
              {sections.information && (
                <div className="p-3.5 bg-blue-50/60 border border-blue-200/70 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                    <Info size={15} className="text-blue-600" />
                    <span>चिकित्सा तथ्य (Veterinary Knowledge)</span>
                  </div>
                  <p className="text-blue-950 leading-relaxed pl-5">
                    {sections.information}
                  </p>
                </div>
              )}

              {/* Guidance */}
              {sections.guidance && (
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/70 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                    <CheckCircle2 size={15} className="text-emerald-700" />
                    <span>देखभाल के प्राथमिक उपाय (Care Guidance)</span>
                  </div>
                  <p className="text-emerald-950 leading-relaxed pl-5">
                    {sections.guidance}
                  </p>
                </div>
              )}

              {/* Next Step */}
              {sections.nextStep && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-300/80 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                    <ArrowRight size={15} className="text-amber-700" />
                    <span>अगला आवश्यक कदम (Recommended Next Step)</span>
                  </div>
                  <p className="text-amber-950 font-semibold leading-relaxed pl-5">
                    {sections.nextStep}
                  </p>
                </div>
              )}

              {/* Disclaimer */}
              {sections.disclaimer && (
                <div className="pt-2 text-[11px] text-slate-500 flex items-start gap-2 border-t border-slate-100">
                  <ShieldAlert size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="italic">{sections.disclaimer}</p>
                </div>
              )}
            </>
          ) : (
            // Raw text or conversational fallback formatted cleanly
            <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
              {formatMarkdown(content)}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Helper to extract structured sections from standard assistant reply
function parseTriageMessage(text) {
  if (!text) return { isStructured: false };

  const urgencyMatch = text.match(/\*\*Urgency:\s*([A-Za-z]+)\*\*/i);
  const observationsMatch = text.match(/\*\*Observations:\*\*\s*([\s\S]*?)(?=\*\*Information:|\*\*Guidance:|\*\*Next Step:|$)/i);
  const informationMatch = text.match(/\*\*Information:\*\*\s*([\s\S]*?)(?=\*\*Guidance:|\*\*Next Step:|\*\*Disclaimer:|$)/i);
  const guidanceMatch = text.match(/\*\*Guidance:\*\*\s*([\s\S]*?)(?=\*\*Next Step:|\*\*Disclaimer:|$)/i);
  const nextStepMatch = text.match(/\*\*Next Step:\*\*\s*([\s\S]*?)(?=\*\*Disclaimer:|$)/i);
  const disclaimerMatch = text.match(/\*\*Disclaimer:\*\*\s*([\s\S]*?)$/i);

  if (urgencyMatch || observationsMatch || guidanceMatch) {
    return {
      isStructured: true,
      urgency: urgencyMatch ? urgencyMatch[1].trim() : '',
      observations: observationsMatch ? observationsMatch[1].trim() : '',
      information: informationMatch ? informationMatch[1].trim() : '',
      guidance: guidanceMatch ? guidanceMatch[1].trim() : '',
      nextStep: nextStepMatch ? nextStepMatch[1].trim() : '',
      disclaimer: disclaimerMatch ? disclaimerMatch[1].trim() : '',
    };
  }

  return { isStructured: false };
}

function formatMarkdown(text) {
  // Simple bold replacer for conversational messages
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
