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
      className={`min-h-screen flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex items-end gap-[3px] h-8">
        {bars.map((i) => (
          <div
            key={i}
            className="w-[3px] rounded-full"
            style={{
              background: 'linear-gradient(to top, #6366f1, #3b82f6)',
              animation: `waveBar 1.1s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <p
        className="mt-6 text-[13px] font-bold tracking-[0.2em] uppercase"
        style={{
          animation: 'fadePulse 2s ease-in-out infinite',
          background: 'linear-gradient(to right, #9333ea, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
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
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  );
}