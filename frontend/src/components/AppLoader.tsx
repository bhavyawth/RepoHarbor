import { useEffect, useState } from 'react';

const bars = [0, 1, 2, 3, 4];

export default function AppLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex items-end gap-[3px] h-8">
        {bars.map((i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-slate-800 dark:bg-slate-200"
            style={{
              animation: `waveBar 1.1s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <p
        className="mt-6 text-[11px] font-medium tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500"
        style={{ animation: 'fadePulse 2s ease-in-out infinite' }}
      >
        RepoHarbor
      </p>
      <style>{`
        @keyframes waveBar {
          0%, 100% { height: 8px; opacity: 0.3; }
          50%       { height: 28px; opacity: 1; }
        }
        @keyframes fadePulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}