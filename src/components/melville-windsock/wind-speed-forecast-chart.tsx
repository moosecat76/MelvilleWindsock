
"use client";

import type { WeatherDataPoint } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Label } from 'recharts';
import { TrendingUp } from 'lucide-react';
import React from 'react';
import { getWindOriginDirection } from '@/lib/weather-utils';

interface WindSpeedForecastChartProps {
  data: WeatherDataPoint[];
}

const chartConfig = {
  windSpeed: {
    label: "Wind Speed (km/h)",
    color: "hsl(var(--accent))",
  },
};

// Custom Tooltip Content to include direction
const CustomTooltipContent = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as WeatherDataPoint; // The full data object for this point
    const windOrigin = getWindOriginDirection(dataPoint.direction);
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-1.5">
          <p className="text-sm font-medium text-foreground">{dataPoint.date}</p>
          <div className="flex items-center">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[2px] mr-1.5"
              style={{ backgroundColor: chartConfig.windSpeed.color }}
            />
            <p className="text-sm text-muted-foreground">
              Speed: <span className="font-mono font-medium tabular-nums text-foreground">{dataPoint.speed} km/h</span>
            </p>
          </div>
          <div className="flex items-center">
             <span
              className="h-2.5 w-2.5 shrink-0 rounded-[2px] mr-1.5 bg-transparent" // Placeholder for alignment
            />
            <p className="text-sm text-muted-foreground">
              From: <span className="font-mono font-medium tabular-nums text-foreground">{windOrigin}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};


export function WindSpeedForecastChart({ data }: WindSpeedForecastChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center">
            <TrendingUp className="mr-2 h-6 w-6 text-primary" />
            10-Day Wind Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No forecast data available.</p>
        </CardContent>
      </Card>
    );
  }
  
  const speeds = data.map(d => d.speed);
  const minSpeed = Math.min(...speeds);
  const maxSpeed = Math.max(...speeds);
  const yDomain = [
    Math.max(0, Math.floor(minSpeed / 5) * 5 - 5), 
    Math.ceil(maxSpeed / 5) * 5 + 5      
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-primary" />
          10-Day Wind Forecast
        </CardTitle>
        <CardDescription>Predicted wind speed and direction (origin) for the next 10 days at Melville Waters.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 20,
                left: -10, 
                bottom: 5,
              }}
              accessibilityLayer
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 6)} 
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={yDomain}
                tickFormatter={(value) => `${value}`}
              >
                <Label
                  value="Wind Speed (km/h)"
                  angle={-90}
                  position="insideLeft"
                  style={{ textAnchor: 'middle', fill: 'hsl(var(--foreground))' }}
                  dy={40} 
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
                dataKey="speed"
                type="monotone"
                fill="url(#fillWindSpeed)"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                name={chartConfig.windSpeed.label} // Used by legend
                dot={false}
                activeDot={{ r: 6, style: { fill: "hsl(var(--background))", stroke: "hsl(var(--accent))" } }}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

