import { FileText, Type, Hash, Shield, Code2, Languages } from 'lucide-react';

export const TaskMetadata = ({ category, metadata }) => {
  if (!metadata || Object.keys(metadata).length === 0) return null;

  const renderChips = () => {
    switch (category) {
      case 'KURS_ISHI':
      case 'REFERAT':
      case 'MUSTAQIL_ISH':
        return (
          <>
            {metadata.pageCount && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-xl text-[11px] font-bold">
                <FileText size={14} /> {metadata.pageCount} sahifa
              </div>
            )}
            {metadata.plagiarismPercent && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-xl text-[11px] font-bold">
                <Shield size={14} /> Antiplagiatura: {metadata.plagiarismPercent}%
              </div>
            )}
          </>
        );

      case 'TARJIMA':
        return (
          <>
            {(metadata.sourceLang || metadata.targetLang) && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-xl text-[11px] font-bold">
                <Languages size={14} /> {metadata.sourceLang || '?'} ➝ {metadata.targetLang || '?'}
              </div>
            )}
            {metadata.wordCount && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl text-[11px] font-bold">
                <Type size={14} /> {metadata.wordCount} ta so'z
              </div>
            )}
          </>
        );

      case 'DASTURLASH':
      case 'LABORATORIYA':
        return (
          <>
            {metadata.programmingLang && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 text-orange-700 dark:text-orange-400 rounded-xl text-[11px] font-bold">
                <Code2 size={14} /> {metadata.programmingLang}
              </div>
            )}
          </>
        );

      default:
        return Object.entries(metadata).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500/10 text-gray-700 dark:text-gray-400 rounded-xl text-[11px] font-bold">
            <Hash size={14} /> {key}: {val}
          </div>
        ));
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {renderChips()}
    </div>
  );
};
