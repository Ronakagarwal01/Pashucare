export default function EmptyState({ icon: Icon, title, description, actionText, onAction }) {
  return (
    <div className="text-center py-14 px-4 bg-white border border-dashed border-slate-300 rounded-3xl space-y-4">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100 shadow-2xs">
          <Icon size={28} />
        </div>
      )}
      <div className="space-y-1 max-w-sm mx-auto">
        <p className="text-base font-bold text-slate-900 font-heading">{title}</p>
        {description && (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            {description}
          </p>
        )}
      </div>
      {actionText && onAction && (
        <div className="pt-2">
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>{actionText}</span>
          </button>
        </div>
      )}
    </div>
  );
}
