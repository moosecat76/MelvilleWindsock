
import type { CurrentWindInfo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge, MapPin, Navigation } from 'lucide-react';
import { getOppositeDirection, COMPASS_DIRECTION_TO_DEGREES } from '@/lib/weather-utils';

interface CurrentWindDisplayProps {
  data: CurrentWindInfo;
}

export function CurrentWindDisplay({ data }: CurrentWindDisplayProps) {
  // data.direction10m is the direction the wind is COMING FROM (e.g., "N")
  const comingFromDirection = data.direction10m;
  // The arrow should point where the wind is BLOWING TOWARDS
  const blowingToDirection = getOppositeDirection(comingFromDirection);
  const rotationDegrees = COMPASS_DIRECTION_TO_DEGREES[blowingToDirection] ?? 0;

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-headline flex items-center justify-between">
          <span>Current Wind (10m)</span>
          <span className="text-sm font-normal text-muted-foreground flex items-center">
            <MapPin className="mr-1 h-4 w-4" />
            Melville Waters, WA
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-start justify-between space-x-4">
        <div className="flex items-center space-x-4">
          <Gauge className="h-16 w-16 text-accent" />
          <div>
            <p className="text-6xl font-bold text-accent font-headline">
              {data.speed10m}
            </p>
            <p className="text-2xl text-muted-foreground">{data.unit}</p>
          </div>
        </div>
        <div className="flex flex-col items-end text-right">
          <Navigation
            className="h-8 w-8 text-primary mb-1"
            style={{ transform: `rotate(${rotationDegrees}deg)` }}
          />
          <p className="text-2xl font-bold text-primary font-headline">
            {comingFromDirection}
          </p>
          <p className="text-sm text-muted-foreground">Direction (from)</p>
        </div>
      </CardContent>
    </Card>
  );
}
