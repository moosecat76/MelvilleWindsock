import type { CurrentWindInfo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge, MapPin } from 'lucide-react';

interface CurrentWindDisplayProps {
  data: CurrentWindInfo;
}

export function CurrentWindDisplay({ data }: CurrentWindDisplayProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-headline flex items-center justify-between">
          <span>Current Wind</span>
          <span className="text-sm font-normal text-muted-foreground flex items-center">
            <MapPin className="mr-1 h-4 w-4" />
            Melville Waters, WA
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center space-x-4">
        <Gauge className="h-16 w-16 text-accent" />
        <div>
          <p className="text-6xl font-bold text-accent font-headline">
            {data.speed}
          </p>
          <p className="text-2xl text-muted-foreground">{data.unit}</p>
        </div>
      </CardContent>
    </Card>
  );
}
