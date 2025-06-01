
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
  
  const iconSize = 16; 

  let arrowColorClass = "text-primary opacity-75"; 
  if (payload.speed10m < 12) {
    arrowColorClass = "text-red-500 opacity-75";
  } else if (payload.speed10m >= 12 && payload.speed10m <= 20) {
    arrowColorClass = "text-yellow-500 opacity-75";
  } else if (payload.speed10m > 20) {
    arrowColorClass = "text-green-500 opacity-75";
  }

  return (
    <g transform={`translate(${cx},${cy}) rotate(${cssRotation})`}>
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

const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  if (!payload || !(payload.value instanceof Date)) {
    return null;
  }
  const date = payload.value;
  const dayOfWeek = format(date, "EEE"); 
  const dayOfMonthWithSuffix = format(date, "do"); 

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12px" className="font-sans">
        <tspan x="0" dy="0em">{dayOfWeek}</tspan>
        <tspan x="0" dy="1.2em">{dayOfMonthWithSuffix}</tspan>
      </text>
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
  let yMax = 25; 

  if (validSpeeds.length > 0) {
    const minSpeed = Math.min(...validSpeeds);
    const maxSpeed = Math.max(...validSpeeds);

    yMin = Math.max(0, Math.floor(minSpeed / 5) * 5 - 5);
    yMax = Math.ceil(maxSpeed / 5) * 5 + 5;
    
    if (yMax <= yMin) { 
      yMax = yMin + 5;
    }
    if (minSpeed === maxSpeed) { 
       yMin = Math.max(0, minSpeed - 5);
       yMax = maxSpeed + 5;
    }
     if (yMin === 0 && yMax === 5 && minSpeed === 0 && maxSpeed === 0) { 
        yMin = 0;
        yMax = 5; 
    } else if (yMin < 0 && minSpeed === 0) { 
        yMin = 0;
    }
  } else if (hourlyData.length > 0 && validSpeeds.length === 0) {
     yMin = 0;
     yMax = 25;
  }
  
  const yDomain: [number, number] = [yMin, yMax];
  const xAxisInterval = 11; 


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
                    return null; 
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
                bottom: 20, 
              }}
              accessibilityLayer
            >
              <CartesianGrid strokeDasharray="3 3" vertical={true} />
              <XAxis
                dataKey="dateTime"
                tickLine={false}
                axisLine={false}
                tickMargin={10} 
                interval={xAxisInterval} 
                tick={<CustomXAxisTick />}
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

