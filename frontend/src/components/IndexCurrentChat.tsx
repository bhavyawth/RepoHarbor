import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';

type Props = {
  onIndex: () => void;
  isLoading?: boolean;
};

export default function IndexCurrentChat({ onIndex, isLoading = false }: Props) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <h2 className="text-2xl font-semibold">Repository not indexed</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Index this repository to start chatting.
        </p>
        <Button
          className="mt-6 w-full transform-gpu transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 bg-linear-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500"
          onClick={onIndex}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Indexing...
            </>
          ) : (
            'Index Repository'
          )}
        </Button>
      </div>
    </div>
  );
}
