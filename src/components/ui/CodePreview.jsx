import { useState, useEffect } from 'react';
import { Code2, Loader2, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { hapticLight } from '../../lib/telegram';

export const CodePreview = ({ file, allowDownload = true }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(file.url);
        if (!response.ok) throw new Error('Failed to fetch file content');
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (file?.url) {
      fetchContent();
    }
  }, [file]);

  const handleCopy = () => {
    hapticLight();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguage = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase() || 'text';
    const map = {
      js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
      py: 'python', json: 'json', md: 'markdown', css: 'css', html: 'html'
    };
    return map[ext] || ext;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/50">
        <Loader2 className="animate-spin" size={32} />
        <span className="text-sm font-medium">Yuklanmoqda...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-red-400">
        <span className="font-bold">Xatolik yuz berdi</span>
        <span className="text-xs opacity-70">{error}</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-edu-primary" />
          <span className="text-xs font-mono text-white/80">{file.name}</span>
        </div>
        {allowDownload && (
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-white/60 hover:text-white"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span className="text-xs font-medium">{copied ? 'Nusxalandi' : "Nusxa ko'chirish"}</span>
          </button>
        )}
      </div>

      {/* Code Content */}
      <div className={`flex-1 overflow-auto rounded-b-xl ${!allowDownload ? 'select-none pointer-events-none' : ''}`}>
        <SyntaxHighlighter
          language={getLanguage(file?.name)}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            background: 'transparent',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          }}
          showLineNumbers={true}
          wrapLines={true}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
