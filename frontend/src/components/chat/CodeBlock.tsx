import { Check, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../ui/button';
import hljs from 'highlight.js/lib/common';
import './code-theme.css';

type CodeBlockProps = {
  code: string;
  language?: string;
};

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const highlightedCode = useMemo(() => {
    const normalizedLanguage = (language || '').toLowerCase();
    if (normalizedLanguage && hljs.getLanguage(normalizedLanguage)) {
      return hljs.highlight(code, {
        language: normalizedLanguage,
        ignoreIllegals: true,
      }).value;
    }
    return hljs.highlightAuto(code).value;
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="code-theme my-2 overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50 transition-colors dark:border-slate-700/90 dark:bg-[#1f2430]">
      <div className="flex items-center justify-between border-b border-slate-200/90 bg-slate-100/80 px-3 py-2 dark:border-slate-700/80 dark:bg-[#232a39]">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-400">
          {language || 'code'}
        </span>
        <Button
          type="button"
          onClick={handleCopy}
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 rounded-md px-2 text-xs transform-gpu transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="overflow-x-auto bg-slate-50 p-3 text-sm leading-6 dark:bg-[#1f2430]">
        <code
          className={language ? `hljs language-${language}` : 'hljs'}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
}
