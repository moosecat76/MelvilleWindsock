
import type { CurrentWindInfo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge, MapPin, Navigation } from 'lucide-react';
import { getOppositeDirection, COMPASS_DIRECTION_TO_DEGREES, DEFAULT_LUCIDE_NAVIGATION_ICON_BEARING } from '@/lib/weather-utils';

interface CurrentWindDisplayProps {
  data: CurrentWindInfo;
}

export function CurrentWindDisplay({ data }: CurrentWindDisplayProps) {
  const comingFromDirection = data.direction10m;
  const blowingToDirection = getOppositeDirection(comingFromDirection);
  // targetBearing is the compass direction the arrow should visually point.
  const targetBearing = COMPASS_DIRECTION_TO_DEGREES[blowingToDirection] ?? 0;

  // Adjust rotation for the Navigation icon's default NW orientation (315 degrees).
  // cssRotation is the actual degrees value to put in the style.
  const cssRotation = (targetBearing - DEFAULT_LUCIDE_NAVIGATION_ICON_BEARING + 360) % 360;

  let arrowColorClass = "text-primary"; // Default color
  if (data.speed10m < 12) {
    arrowColorClass = "text-red-500";
  } else if (data.speed10m >= 12 && data.speed10m <= 20) {
    arrowColorClass = "text-yellow-500";
  } else if (data.speed10m > 20) {
    arrowColorClass = "text-green-500";
  }

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
            className={`h-16 w-16 mb-1 ${arrowColorClass}`}
            style={{ transform: `rotate(${cssRotation}deg)` }}
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
