import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';

type CodeBlockProps = {
  code: string;
  language?: string;
};

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

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
    <div className="my-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-sm dark:border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800/90 bg-slate-900/90 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {language || 'code'}
        </span>
        <Button
          type="button"
          onClick={handleCopy}
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 rounded-md px-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-6">
        <code className={language ? `hljs language-${language}` : 'hljs'}>{code}</code>
      </pre>
    </div>
  );
}
