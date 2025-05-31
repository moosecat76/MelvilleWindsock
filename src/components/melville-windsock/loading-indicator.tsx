import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({ message = "Fetching latest wind data..." }: LoadingIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-10">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground font-medium">{message}</p>
    </div>
  );
}
