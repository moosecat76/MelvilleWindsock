
// @ts-nocheck
// TODO: Remove @ts-nocheck and fix type errors
"use server";

import { selectWeatherApi, type SelectWeatherApiInput } from '@/ai/flows/select-weather-api';
import type { FullWeatherData, ApiDetails, WeatherDataPoint, CurrentWindInfo } from '@/types';
import { addDays, format, addHours, startOfDay } from 'date-fns';

// Mock APIs matching the structure expected by selectWeatherApi flow
const mockApis: ApiDetails[] = [
  { name: "OpenMeteoX", description: "Advanced open-source API with high resolution.", accuracy: 0.92, recency: 0.5, consistency: 0.95 },
  { name: "WAWeatherGov", description: "Official Western Australia government data, updated frequently.", accuracy: 0.88, recency: 1, consistency: 0.98 },
  { name: "WindyPro", description: "Professional grade API, broad coverage.", accuracy: 0.90, recency: 2, consistency: 0.90 },
  { name: "LocalSensorNet", description: "Hyperlocal sensor network data, very recent but can be noisy.", accuracy: 0.75, recency: 0.25, consistency: 0.70 },
];

const windDirections = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
const getRandomDirection = () => windDirections[Math.floor(Math.random() * windDirections.length)];

export async function fetchMelvilleWindsData(): Promise<FullWeatherData> {
  try {
    const input: SelectWeatherApiInput = { availableApis: mockApis };
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate AI call latency
    const aiSelection = await selectWeatherApi(input);

    const baseSpeed = 10 + Math.random() * 10;

    const currentSpeed: CurrentWindInfo = {
      speed: Math.max(0, Math.floor(baseSpeed + (Math.random() * 10 - 5))),
      unit: "km/h",
      direction: getRandomDirection(),
    };

    const forecast: WeatherDataPoint[] = [];
    const today = startOfDay(new Date());

    for (let dayIndex = 0; dayIndex < 10; dayIndex++) {
      const currentDayBase = addDays(today, dayIndex);
      for (let hourInterval = 0; hourInterval < 12; hourInterval++) { // 12 intervals of 2 hours
        const dateTime = addHours(currentDayBase, hourInterval * 2);
        
        let intervalSpeed = baseSpeed + (Math.random() * 15 - 7.5) + (dayIndex * 0.2) + (hourInterval * 0.1);
        intervalSpeed = Math.max(0, Math.min(40, intervalSpeed)); // Cap speed

        forecast.push({
          dateTime: dateTime,
          date: format(dateTime, "MMM d, HH:mm"), // For display or tooltip
          fullDate: format(dateTime, "yyyy-MM-dd HH:mm:ss"), // For detailed reference
          speed: Math.floor(intervalSpeed),
          direction: getRandomDirection(),
        });
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate weather data fetching latency

    return {
      currentSpeed,
      forecast,
      selectedApiName: aiSelection.selectedApiName,
      reasoning: aiSelection.reason,
    };
  } catch (error) {
    console.error("Error fetching Melville winds data:", error);
    const fallbackDate = new Date();
    const fallbackForecast: WeatherDataPoint[] = [];
    for (let i = 0; i < 10 * 12; i++) { // 10 days, 12 2-hour intervals
        const dateTime = addHours(addDays(startOfDay(fallbackDate), Math.floor(i/12)), (i%12)*2);
        fallbackForecast.push({
            dateTime: dateTime,
            date: format(dateTime, "MMM d, HH:mm"),
            fullDate: format(dateTime, "yyyy-MM-dd HH:mm:ss"),
            speed: 10 + Math.floor(Math.random() * 10),
            direction: getRandomDirection(),
        });
    }
    return {
      currentSpeed: { speed: 15, unit: "km/h", direction: "S" },
      forecast: fallbackForecast,
      selectedApiName: "Fallback Weather Service",
      reasoning: "Could not connect to the intelligent API selector or fetch live data. Displaying estimates.",
    };
  }
}
