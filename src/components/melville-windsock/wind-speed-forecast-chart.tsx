
"use client";

import type { WeatherDataPoint } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Label } from 'recharts';
import { TrendingUp, Navigation } from 'lucide-react';
import React from 'react';
import { getOppositeDirection, COMPASS_DIRECTION_TO_DEGREES, DEFAULT_LUCIDE_NAVIGATION_ICON_BEARING } from '@/lib/weather-utils';
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

const CustomTooltipContent = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as WeatherDataPoint;
    const comingFromDirection = dataPoint.direction10m;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-1.5">
          <p className="text-sm font-medium text-foreground">{format(dataPoint.dateTime, "EEE, MMM d, HH:mm")}</p>
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
              className="h-2.5 w-2.5 shrink-0 rounded-[2px] mr-1.5 bg-transparent"
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

const ForecastArrowDot = (props: any) => {
  const { cx, cy, payload } = props;

  if (!payload || typeof payload.direction10m === 'undefined' || cx == null || cy == null) {
    return null;
  }

  const comingFromDirection = String(payload.direction10m);
  const blowingToDirection = getOppositeDirection(comingFromDirection);
  const targetBearing = COMPASS_DIRECTION_TO_DEGREES[blowingToDirection] ?? 0;
  
  const cssRotation = (targetBearing - DEFAULT_LUCIDE_NAVIGATION_ICON_BEARING + 360) % 360;
  
  const iconSize = 20 * 2; // Increased size

  let arrowColorClass = "text-primary opacity-75"; // Increased opacity
  if (payload.speed10m < 12) {
    arrowColorClass = "text-red-500 opacity-75";
  } else if (payload.speed10m >= 12 && payload.speed10m <= 20) {
    arrowColorClass = "text-yellow-500 opacity-75";
  } else if (payload.speed10m > 20) {
    arrowColorClass = "text-green-500 opacity-75";
  }

  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${cssRotation})`}>
      <Navigation
        className={arrowColorClass}
        width={iconSize}
        height={iconSize}
        x={-iconSize / 2} 
        y={-iconSize / 2} 
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
            5-Day Wind Forecast (10m)
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
  const yDomain: [number, number] = [
    Math.max(0, Math.floor(minSpeed / 5) * 5 - 5), 
    Math.ceil(maxSpeed / 5) * 5 + 5      
  ];

  // Assuming 2-hourly data, 12 data points per day.
  // interval={11} will show a tick for every 12th data point (i.e., once per day).
  const xAxisInterval = data.length > 12 ? 11 : 0;


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-primary" />
          5-Day Wind Forecast (10m)
        </CardTitle>
        <CardDescription>Predicted 2-hourly wind speed and direction (origin) at 10m height for the next 5 days at Melville Waters.</CardDescription>
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
              <CartesianGrid strokeDasharray="3 3" vertical={true} />
              <XAxis
                dataKey="dateTime"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={xAxisInterval} 
                tickFormatter={(value: Date) => format(value, "EEE, MMM d")} 
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
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

