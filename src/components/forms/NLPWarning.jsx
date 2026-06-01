// src/components/forms/NLPWarning.jsx
import { AlertTriangle, XCircle } from 'lucide-react';
import { NLP_PATTERNS } from '../../lib/constants';

export function useNLPCheck(text = '') {
  for (const { pattern, severity } of NLP_PATTERNS) {
    if (pattern.test(text)) return severity;
  }
  return null;
}

export function NLPWarning({ text = '' }) {
  const severity = useNLPCheck(text);
  if (!severity) return null;

  if (severity === 'block') {
    return (
      <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl px-3 py-2.5">
        <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-red-700 leading-relaxed font-medium">
          Bu so'rov platforma qoidalariga zid. Akademik halollik siyosatimizga amal qiling.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-600 rounded-xl px-3 py-2.5">
      <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-yellow-700 leading-relaxed font-medium">
        ⚠ Bu so'rov tizim qoidalariga zid bo'lishi mumkin. Iltimos qayta ifodalang.
      </p>
    </div>
  );
}

export default NLPWarning;
