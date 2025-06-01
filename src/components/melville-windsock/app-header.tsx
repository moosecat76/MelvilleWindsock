
import { Wind } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="w-full py-6">
      <div className="flex items-center space-x-3">
        <Wind className="h-10 w-10 text-primary" />
        <h1 className="font-headline text-4xl font-bold text-primary">
          Melville Windsock
        </h1>
      </div>
      <p className="mt-1 text-lg text-muted-foreground">
        Your 7-day wind speed forecast for Melville Waters, WA.
      </p>
    </header>
  );
}
