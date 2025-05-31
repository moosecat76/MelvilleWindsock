
// @ts-nocheck
// TODO: Remove @ts-nocheck and fix type errors
"use server";

import { selectWeatherApi, type SelectWeatherApiInput } from '@/ai/flows/select-weather-api';
import type { FullWeatherData, ApiDetails, WeatherDataPoint, CurrentWindInfo } from '@/types';
import { addDays, format } from 'date-fns';

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
    // Add a small delay to simulate network latency for AI call
    await new Promise(resolve => setTimeout(resolve, 500));
    const aiSelection = await selectWeatherApi(input);

    // Simulate data fetching based on aiSelection.selectedApiName
    // For now, always return the same mock data structure but with slight variations
    const baseSpeed = 10 + Math.random() * 10; // Base speed between 10 and 20

    const currentSpeed: CurrentWindInfo = {
      speed: Math.floor(baseSpeed + (Math.random() * 10 - 5)), // Vary current speed around base
      unit: "km/h",
      direction: getRandomDirection(),
    };
    if (currentSpeed.speed < 0) currentSpeed.speed = 0;


    const forecast: WeatherDataPoint[] = Array.from({ length: 10 }).map((_, i) => {
      const date = addDays(new Date(), i);
      let daySpeed = baseSpeed + (Math.random() * 15 - 7.5) + (i * 0.5); // Speed varies and slightly trends
      if (daySpeed < 0) daySpeed = 0;
      if (daySpeed > 40) daySpeed = 40; // Cap speed

      return {
        date: format(date, "MMM d"),
        fullDate: format(date, "yyyy-MM-dd"),
        speed: Math.floor(daySpeed),
        direction: getRandomDirection(),
      };
    });
    
    // Add another delay to simulate weather data fetching
    await new Promise(resolve => setTimeout(resolve, 700));

    return {
      currentSpeed,
      forecast,
      selectedApiName: aiSelection.selectedApiName,
      reasoning: aiSelection.reason,
    };
  } catch (error) {
    console.error("Error fetching Melville winds data:", error);
    // Fallback data in case of an error
    const fallbackDate = new Date();
    return {
      currentSpeed: { speed: 15, unit: "km/h", direction: "S" },
      forecast: Array.from({ length: 10 }).map((_, i) => ({
        date: format(addDays(fallbackDate, i), "MMM d"),
        fullDate: format(addDays(fallbackDate, i), "yyyy-MM-dd"),
        speed: 10 + Math.floor(Math.random() * 10),
        direction: getRandomDirection(),
      })),
      selectedApiName: "Fallback Weather Service",
      reasoning: "Could not connect to the intelligent API selector or fetch live data. Displaying estimates.",
    };
  }
}
