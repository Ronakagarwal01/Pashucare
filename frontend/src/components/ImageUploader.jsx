import { useRef, useState, useEffect } from 'react';
import { UploadCloud, X, Loader2, Sparkles, CheckCircle2, Image as ImageIcon, Camera, AlertCircle } from 'lucide-react';

const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export default function ImageUploader({ file, setFile, onAnalyze, loading }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFile(f) {
    if (!f) return;
    setErrorMessage('');
    if (!ALLOWED.includes(f.type)) {
      setErrorMessage('केवल JPG, PNG, WEBP फोटो समर्थित हैं / Only JPG, PNG, WEBP accepted.');
      return;
    }
    if (f.size > MAX_SIZE) {
      setErrorMessage('फ़ोटो का आकार 5 MB से कम होना चाहिए / File size must be under 5 MB.');
      return;
    }
    setFile(f);
  }

  return (
    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-3">
      
      {/* Upload Box */}
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-slate-300 hover:border-emerald-500 hover:bg-white'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2.5 border border-emerald-200 shadow-2xs">
            <Camera size={22} />
          </div>
          <p className="text-sm font-extrabold text-slate-900 font-heading">
            पशु की फोटो अपलोड करें / Click or Drag Animal Photo Here
          </p>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
            घाव, आंख से पानी/लालिमा, त्वचा पर चकत्ते, या खड़े होने की मुद्रा की स्पष्ट फोटो लें (JPG, PNG • अधिकतम 5 MB)
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 shadow-2xs">
            <UploadCloud size={13} className="text-emerald-600" />
            <span>फ़ाइल चुनें / Browse File</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {preview ? (
              <img
                src={preview}
                alt="Uploaded Preview"
                className="w-16 h-16 object-cover rounded-xl border-2 border-emerald-500 shadow-xs shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                <ImageIcon size={24} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate font-heading">{file.name}</p>
              <p className="text-[11px] text-slate-500 font-medium">{(file.size / 1024).toFixed(1)} KB • तैयार है</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setFile(null)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Remove image"
            >
              <X size={18} />
            </button>

            <button
              onClick={() => onAnalyze(file)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>जांच जारी है / Inspecting...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>कंप्यूटर विज़न जांच शुरू करें / Analyze Photo</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <AlertCircle size={15} className="shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

    </div>
  );
}
