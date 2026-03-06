import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-white px-6 py-10 text-center dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/95 px-10 py-12 text-center shadow-[0_16px_40px_-24px_rgba(15,23,42,0.18)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/85 dark:shadow-[0_16px_40px_-24px_rgba(0,0,0,0.8)]">
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xl font-semibold tracking-widest text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500">
          404
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button
          onClick={() => navigate('/chat/new', { replace: true })}
          className="mt-8 inline-flex items-center gap-2 transform-gpu transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back to chat
        </Button>
      </div>
    </section>
  );
}
