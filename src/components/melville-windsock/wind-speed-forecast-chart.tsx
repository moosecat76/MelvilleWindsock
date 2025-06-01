
"use client";

import type { WeatherDataPoint, DailyForecastSummary } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Label } from 'recharts';
import { TrendingUp, Navigation } from 'lucide-react';
import React from 'react';
import { getOppositeDirection, COMPASS_DIRECTION_TO_DEGREES, DEFAULT_LUCIDE_NAVIGATION_ICON_BEARING, getWeatherIconAndDescription } from '@/lib/weather-utils';
import { format } from 'date-fns';

interface WindSpeedForecastChartProps {
  hourlyData: WeatherDataPoint[];
  dailySummaryData: DailyForecastSummary[];
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
              className="h-2.5 w-2.5 shrink-0 rounded-[2px] mr-1.5 bg-transparent" // Invisible spacer
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

  if (!payload || typeof payload.direction10m === 'undefined' || typeof payload.speed10m !== 'number' || cx == null || cy == null || isNaN(cx) || isNaN(cy)) {
    return null;
  }

  const comingFromDirection = String(payload.direction10m);
  const blowingToDirection = getOppositeDirection(comingFromDirection);
  const targetBearing = COMPASS_DIRECTION_TO_DEGREES[blowingToDirection] ?? 0;
  
  const cssRotation = (targetBearing - DEFAULT_LUCIDE_NAVIGATION_ICON_BEARING + 360) % 360;
  
  const iconSize = 20 * 2; 

  let arrowColorClass = "text-primary opacity-75"; 
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


export function WindSpeedForecastChart({ hourlyData, dailySummaryData }: WindSpeedForecastChartProps) {
  if (!hourlyData || hourlyData.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center">
            <TrendingUp className="mr-2 h-6 w-6 text-primary" />
            7-Day Wind Forecast (10m)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>No forecast data available.</p>
        </CardContent>
      </Card>
    );
  }
  
  const validSpeeds = hourlyData
    .map(d => d.speed10m)
    .filter(s => typeof s === 'number' && isFinite(s));

  let yMin = 0;
  let yMax = 25; // Default Y-axis max if no valid speeds

  if (validSpeeds.length > 0) {
    const minSpeed = Math.min(...validSpeeds);
    const maxSpeed = Math.max(...validSpeeds);

    yMin = Math.max(0, Math.floor(minSpeed / 5) * 5 - 5);
    yMax = Math.ceil(maxSpeed / 5) * 5 + 5;
    
    if (yMax <= yMin) { // Ensure yMax is greater than yMin
      yMax = yMin + 5;
    }
    if (minSpeed === maxSpeed) { // Handle case where all speeds are the same
       yMin = Math.max(0, minSpeed - 5);
       yMax = maxSpeed + 5;
    }
    if (yMin === 0 && yMax === 0 && hourlyData.some(d => d.speed10m === 0)) { // All speeds are 0
        yMax = 5; // Give some room above 0
    }


  } else if (hourlyData.length > 0 && validSpeeds.length === 0) {
    // Data exists but no valid speeds, use default yMin=0, yMax=25
  }
  // If hourlyData itself is empty, the component returns early.

  const yDomain: [number, number] = [yMin, yMax];

  const xAxisInterval = hourlyData.length > 24 ? Math.floor(hourlyData.length / 7 / 6) * 2 : 0; // Adjust for 7 days, 2-hourly


  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-headline flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-primary" />
          7-Day Wind Forecast (10m)
        </CardTitle>
        <CardDescription>Predicted 2-hourly wind speed and direction (origin) at 10m height for the next 7 days at Melville Waters, with daily weather summaries.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {dailySummaryData && dailySummaryData.length > 0 && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg shadow-sm">
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center">
              {dailySummaryData.map((day) => {
                 try {
                    const { icon: WeatherIcon, description: weatherDesc } = getWeatherIconAndDescription(day.weatherCode);
                    // Ensure date is valid before trying to format or get ISO string for key
                    const dayKey = day.date instanceof Date && !isNaN(day.date.valueOf()) ? day.date.toISOString() : String(Math.random());
                    const dayFormatted = day.date instanceof Date && !isNaN(day.date.valueOf()) ? format(day.date, "EEE") : "N/A";
                    
                    return (
                      <div key={dayKey} className="flex flex-col items-center p-2 rounded-md bg-background shadow-xs hover:shadow-md transition-shadow" title={weatherDesc}>
                        <p className="text-xs sm:text-sm font-medium text-primary">{dayFormatted}</p>
                        <WeatherIcon className="h-6 w-6 sm:h-8 sm:w-8 my-1 text-accent" />
                        <p className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                          {day.tempMin}°<span className="hidden sm:inline">C</span>-{day.tempMax}°<span className="hidden sm:inline">C</span>
                        </p>
                      </div>
                    );
                  } catch (e) {
                    console.error("Error rendering daily summary item for date:", day.date, e);
                    return null; // Skip rendering this item if it errors
                  }
              })}
            </div>
          </div>
        )}

        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={hourlyData}
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
