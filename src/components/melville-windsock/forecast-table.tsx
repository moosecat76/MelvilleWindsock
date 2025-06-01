
"use client";

import type { WeatherDataPoint } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { List } from 'lucide-react';
import { format } from 'date-fns';

interface ForecastTableProps {
  data: WeatherDataPoint[];
}

export function ForecastTable({ data }: ForecastTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-headline flex items-center">
            <List className="mr-2 h-5 w-5 text-primary" />
            Detailed Forecast (10m)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No forecast data available for the table.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center">
          <List className="mr-2 h-6 w-6 text-primary" />
          Detailed 7-Day Forecast (10m)
        </CardTitle>
        <CardDescription>2-hourly wind speed and direction (origin) predictions at 10m height for Melville Waters.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[180px]">Date & Time</TableHead>
                <TableHead className="text-right">Speed (10m) (kn)</TableHead>
                <TableHead className="text-center">Direction (10m) (from)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.dateTime.toISOString()}>
                  <TableCell className="font-medium">{format(item.dateTime, "MMM d, HH:mm")}</TableCell>
                  <TableCell className="text-right">{item.speed10m}</TableCell>
                  <TableCell className="text-center">{item.direction10m}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
