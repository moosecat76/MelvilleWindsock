import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Info } from 'lucide-react';

interface ApiSelectionInfoProps {
  apiName: string;
  reasoning: string;
}

export function ApiSelectionInfo({ apiName, reasoning }: ApiSelectionInfoProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-headline flex items-center">
          <Info className="mr-2 h-5 w-5 text-primary" />
          Intelligent API Selection
        </CardTitle>
        <CardDescription>
          The most reliable weather API was chosen using AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center">
          <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
          <p>
            <span className="font-semibold">Selected API:</span> {apiName}
          </p>
        </div>
        <div>
          <p className="font-semibold">Reasoning:</p>
          <p className="text-sm text-muted-foreground">{reasoning}</p>
        </div>
      </CardContent>
    </Card>
  );
}
