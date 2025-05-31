"use client";

import type { WeatherDataPoint } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Label } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface WindSpeedForecastChartProps {
  data: WeatherDataPoint[];
}

const chartConfig = {
  windSpeed: {
    label: "Wind Speed (km/h)",
    color: "hsl(var(--accent))",
  },
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
  
  // Find min and max speed for Y-axis domain
  const speeds = data.map(d => d.speed);
  const minSpeed = Math.min(...speeds);
  const maxSpeed = Math.max(...speeds);
  const yDomain = [
    Math.max(0, Math.floor(minSpeed / 5) * 5 - 5), // a bit below min, multiple of 5, at least 0
    Math.ceil(maxSpeed / 5) * 5 + 5      // a bit above max, multiple of 5
  ];


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-primary" />
          10-Day Wind Forecast
        </CardTitle>
        <CardDescription>Predicted wind speed for the next 10 days at Melville Waters.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 20,
                left: -10, // Adjust to make Y-axis labels visible
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
                tickFormatter={(value) => value.slice(0, 6)} // Shorten date string if needed
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
                  dy={40} // Adjust position from axis
                />
              </YAxis>
              <ChartTooltip
                cursor={true}
                content={<ChartTooltipContent indicator="line" />}
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
                name="Wind Speed"
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
