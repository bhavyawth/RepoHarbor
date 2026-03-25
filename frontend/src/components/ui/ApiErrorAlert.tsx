import { AlertCircle } from 'lucide-react';

type ApiErrorAlertProps = {
  error: unknown;
  className?: string;
};

export default function ApiErrorAlert({
  error,
  className = '',
}: ApiErrorAlertProps) {
  const rawMessage =
    typeof error === 'string'
      ? error
      : (error as { message?: string } | null)?.message || 'Something went wrong';
  const message =
    rawMessage.length > 180 ? `${rawMessage.slice(0, 180).trimEnd()}...` : rawMessage;

  return (
    <div
      className={`rounded-lg border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200 ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-6 break-words">{message}</p>
        </div>
      </div>
    </div>
  );
}
