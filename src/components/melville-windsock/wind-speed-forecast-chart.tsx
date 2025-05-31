
"use client";

import type { WeatherDataPoint } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Label } from 'recharts';
import { TrendingUp, Navigation } from 'lucide-react';
import React from 'react';
import { getOppositeDirection, COMPASS_DIRECTION_TO_DEGREES } from '@/lib/weather-utils';
import { format } from 'date-fns';

interface WindSpeedForecastChartProps {
  data: WeatherDataPoint[];
}

const chartConfig = {
  windSpeed: {
    label: "Wind Speed (10m) (kn)",
    color: "hsl(var(--accent))",
  },
};

// Custom Tooltip Content to include direction and formatted time
const CustomTooltipContent = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as WeatherDataPoint;
    const comingFromDirection = dataPoint.direction10m;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-1.5">
          <p className="text-sm font-medium text-foreground">{format(dataPoint.dateTime, "MMM d, HH:mm")}</p>
          <div className="flex items-center">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[2px] mr-1.5"
              style={{ backgroundColor: chartConfig.windSpeed.color }}
            />
            <p className="text-sm text-muted-foreground">
              Speed (10m): <span className="font-mono font-medium tabular-nums text-foreground">{dataPoint.speed10m} kn</span>
            </p>
          </div>
          <div className="flex items-center">
             <span
              className="h-2.5 w-2.5 shrink-0 rounded-[2px] mr-1.5 bg-transparent" // Transparent spacer
            />
            <p className="text-sm text-muted-foreground">
              From: <span className="font-mono font-medium tabular-nums text-foreground">{comingFromDirection}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Dot for rendering wind direction arrows on the chart
const ForecastArrowDot = ({ cx, cy, payload }: any) => {
  if (!payload || typeof payload.direction10m === 'undefined' || cx === null || cy === null) {
    return null;
  }

  const comingFromDirection = payload.direction10m;
  // The arrow should point where the wind is BLOWING TOWARDS.
  // The `direction10m` in payload is where it's COMING FROM.
  const blowingToDirection = getOppositeDirection(comingFromDirection);
  const rotationDegrees = COMPASS_DIRECTION_TO_DEGREES[blowingToDirection] ?? 0;
  const iconSize = 10; // Reduced size for better visual density

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <Navigation
        className="text-primary opacity-50"  // Slightly reduced opacity
        style={{ transform: `rotate(${rotationDegrees}deg)` }}
        width={iconSize}
        height={iconSize}
        transform={`translate(${-iconSize / 2}, ${-iconSize / 2})`} 
      />
    </g>
  );
};


export function WindSpeedForecastChart({ data }: WindSpeedForecastChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center">
            <TrendingUp className="mr-2 h-6 w-6 text-primary" />
            10-Day Wind Forecast (10m)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No forecast data available.</p>
        </CardContent>
      </Card>
    );
  }
  
  const speeds = data.map(d => d.speed10m);
  const minSpeed = Math.min(...speeds);
  const maxSpeed = Math.max(...speeds);
  const yDomain = [
    Math.max(0, Math.floor(minSpeed / 5) * 5 - 5), 
    Math.ceil(maxSpeed / 5) * 5 + 5      
  ];

  const xAxisInterval = data.length > 24 ? 11 : 0; // Show 1 tick per day approx (12 2-hr intervals per day)

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-primary" />
          10-Day Wind Forecast (10m)
        </CardTitle>
        <CardDescription>Predicted 2-hourly wind speed and direction (origin) at 10m height for the next 10 days at Melville Waters.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 20, 
                right: 20,
                left: -10, 
                bottom: 5,
              }}
              accessibilityLayer
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="dateTime"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={xAxisInterval} 
                tickFormatter={(value: Date) => format(value, "MMM d")} 
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={yDomain}
                tickFormatter={(value) => `${value}`}
              >
                <Label
                  value="Wind Speed (10m) (kn)"
                  angle={-90}
                  position="insideLeft"
                  style={{ textAnchor: 'middle', fill: 'hsl(var(--foreground))' }}
                  dy={60} 
                />
              </YAxis>
              <ChartTooltip
                cursor={true}
                content={<CustomTooltipContent />}
              />
              <defs>
                <linearGradient id="fillWindSpeed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area
                dataKey="speed10m"
                type="monotone"
                fill="url(#fillWindSpeed)"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                name={chartConfig.windSpeed.label}
                dot={<ForecastArrowDot />}
                activeDot={{ r: 6, style: { fill: "hsl(var(--accent))", stroke: "hsl(var(--background))", strokeWidth: 2 } }}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

