import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

type TerminalStatus = 'idle' | 'running' | 'done' | 'failed';

interface IndexingTerminalProps {
  repoId: string;
  repoName?: string;
  status: TerminalStatus;
  errorMessage?: string | null;
  className?: string;
}

const STEP_DELAY_MS = 480;
const CHAR_TYPE_MS = 15;
const CURSOR_BLINK_MS = 530;
const LINE_COMPLETE_DELAY_MS = 90;

const STATUS_STYLES: Record<TerminalStatus, string> = {
  idle: 'bg-slate-200 text-slate-700 ring-slate-300/80 dark:bg-slate-500/25 dark:text-slate-200 dark:ring-slate-400/40',
  running: 'bg-amber-100 text-amber-700 ring-amber-200/90 dark:bg-amber-400/20 dark:text-amber-200 dark:ring-amber-300/40',
  done: 'bg-emerald-100 text-emerald-700 ring-emerald-200/90 dark:bg-emerald-400/20 dark:text-emerald-200 dark:ring-emerald-300/40',
  failed: 'bg-rose-100 text-rose-700 ring-rose-200/90 dark:bg-rose-400/20 dark:text-rose-200 dark:ring-rose-300/40',
};

function getIndexingSteps(repoName?: string): string[] {
  const repo = repoName || 'repository';
  return [
    `Initializing repository analysis for ${repo}...`,
    'Fetching repository metadata...',
    'Cloning default branch...',
    'Parsing directory structure...',
    'Extracting file tree...',
    'Detecting programming languages...',
    'Chunking source files...',
    'Generating embeddings...',
    'Uploading vectors...',
    'Finalizing index...',
  ];
}

export default function IndexingTerminal({
  repoId,
  repoName,
  status,
  errorMessage,
  className,
}: IndexingTerminalProps) {
  const [renderedLines, setRenderedLines] = useState<string[]>([]);
  const [typingLine, setTypingLine] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  
  const queueRef = useRef<string[]>([]);
  const isTypingRef = useRef(false);
  const cancelTypingRef = useRef(false);
  const typingIntervalRef = useRef<number | null>(null);
  const timeoutIdsRef = useRef<number[]>([]);
  const terminalEventKeyRef = useRef<string>('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  const steps = useMemo(() => getIndexingSteps(repoName), [repoName]);
  const terminalTitle = repoName ? `${repoName} indexing` : 'Repository indexing';
  
  useEffect(() => {
    const timer = window.setInterval(
      () => setCursorVisible((prev) => !prev),
      CURSOR_BLINK_MS
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [renderedLines, typingLine]);

  const stopTypingInterval = () => {
    if (typingIntervalRef.current) {
      window.clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  };

  const clearAllTimers = () => {
    timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutIdsRef.current = [];
    stopTypingInterval();
  };

  const scheduleTimeout = (fn: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timeoutIdsRef.current = timeoutIdsRef.current.filter((activeId) => activeId !== id);
      fn();
    }, delay);
    timeoutIdsRef.current.push(id);
  };

  const typeNextLine = () => {
    if (isTypingRef.current || cancelTypingRef.current) return;
    const nextLine = queueRef.current.shift();
    if (!nextLine) return;
    isTypingRef.current = true;
    let charIndex = 0;
    setTypingLine('');
    typingIntervalRef.current = window.setInterval(() => {
      if (cancelTypingRef.current) {
        stopTypingInterval();
        isTypingRef.current = false;
        return;
      }
      charIndex++;
      setTypingLine(nextLine.slice(0, charIndex));
      if (charIndex >= nextLine.length) {
        stopTypingInterval();
        setTypingLine('');
        scheduleTimeout(() => {
          setRenderedLines((prev) => [...prev, nextLine]);
          isTypingRef.current = false;
          scheduleTimeout(typeNextLine, LINE_COMPLETE_DELAY_MS);
        }, 0);
      }
    }, CHAR_TYPE_MS);
  };

  const enqueueLine = (line: string) => {
    queueRef.current.push(line);
    typeNextLine();
  };

  useEffect(() => {
    cancelTypingRef.current = true;
    queueRef.current = [];
    clearAllTimers();
    setRenderedLines([]);
    setTypingLine('');
    terminalEventKeyRef.current = '';

    if (status !== 'running') return;

    cancelTypingRef.current = false;
    steps.forEach((line, index) => {
      scheduleTimeout(() => enqueueLine(line), index * STEP_DELAY_MS);
    });

    return () => {
      cancelTypingRef.current = true;
      queueRef.current = [];
      clearAllTimers();
    };
  }, [repoId, status, steps]);

  useEffect(() => {
    const eventKey = `${repoId}:${status}:${errorMessage ?? ''}`;
    if (terminalEventKeyRef.current === eventKey) return;
    terminalEventKeyRef.current = eventKey;

    if (status === 'done') {
      enqueueLine('Repository indexed successfully.');
    } else if (status === 'failed') {
      const errorMsg = errorMessage?.trim() || 'Indexing failed unexpectedly.';
      enqueueLine(`Error: ${errorMsg}`);
    }
  }, [repoId, status, errorMessage]);

  useEffect(() => () => clearAllTimers(), []);

  return (
    <div
      className={cn(
        'w-[min(760px,94vw)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/85 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/15 dark:bg-slate-950/70 dark:shadow-2xl',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <p className="text-xs font-medium tracking-wide text-slate-700 dark:text-slate-200">
            {terminalTitle}
          </p>
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset',
            STATUS_STYLES[status]
          )}
        >
          {status}
        </span>
      </div>
      {/* Terminal Content */}
      <div className="max-h-[340px] overflow-y-auto px-4 py-3 font-mono text-sm leading-6">
        {renderedLines.map((line, index) => (
          <div
            key={index}
            className={cn(
              line.startsWith('Error:') ? 'text-rose-600 dark:text-rose-300' : 'text-slate-800 dark:text-slate-200'
            )}
          >
            {line}
          </div>
        ))}
        {typingLine && (
          <div className="text-slate-800 dark:text-slate-200">{typingLine}</div>
        )}
        <span
          className={cn(
            'inline-block ml-0.5 h-4 w-2 rounded-[2px] bg-slate-500/90 transition-opacity dark:bg-slate-300/90',
            cursorVisible ? 'opacity-100' : 'opacity-0'
          )}
        />
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
