
// @ts-nocheck
// TODO: Remove @ts-nocheck and fix type errors
"use server";

import { selectWeatherApi, type SelectWeatherApiInput } from '@/ai/flows/select-weather-api';
import type { FullWeatherData, ApiDetails, WeatherDataPoint, CurrentWindInfo } from '@/types';
import { degreesToCardinal } from '@/lib/weather-utils';
import { format, addHours, startOfDay, addDays } from 'date-fns'; // addDays, startOfDay, addHours needed for fallback

// Mock APIs matching the structure expected by selectWeatherApi flow
const mockApis: ApiDetails[] = [
  { name: "OpenMeteoX", description: "Advanced open-source API with high resolution.", accuracy: 0.92, recency: 0.5, consistency: 0.95 },
  { name: "WAWeatherGov", description: "Official Western Australia government data, updated frequently.", accuracy: 0.88, recency: 1, consistency: 0.98 },
  { name: "WindyPro", description: "Professional grade API, broad coverage.", accuracy: 0.90, recency: 2, consistency: 0.90 },
  { name: "LocalSensorNet", description: "Hyperlocal sensor network data, very recent but can be noisy.", accuracy: 0.75, recency: 0.25, consistency: 0.70 },
];

// For fallback data
const windDirections = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
const getRandomDirection = () => windDirections[Math.floor(Math.random() * windDirections.length)];


const MELVILLE_LAT = -32.00;
const MELVILLE_LON = 115.82;
const FORECAST_DAYS = 5; // Changed from 10 to 5

export async function fetchMelvilleWindsData(): Promise<FullWeatherData> {
  let aiSelection = { selectedApiName: "AI Selector Placeholder", reasoning: "AI API selection process is part of the flow." };
  try {
    const input: SelectWeatherApiInput = { availableApis: mockApis };
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate AI call latency
    aiSelection = await selectWeatherApi(input);
  } catch (aiError) {
    console.warn("AI API selection failed:", aiError);
    aiSelection.selectedApiName = "AI Selector Error";
    aiSelection.reasoning = "Could not run the AI API selection process.";
  }
  
  try {
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${MELVILLE_LAT}&longitude=${MELVILLE_LON}&current=wind_speed_10m,wind_direction_10m&hourly=wind_speed_10m,wind_direction_10m&wind_speed_unit=kn&timeformat=unixtime&forecast_days=${FORECAST_DAYS}`;
    
    const response = await fetch(openMeteoUrl, { next: { revalidate: 3600 } }); // Revalidate data every hour
    if (!response.ok) {
      throw new Error(`Open-Meteo API request failed with status ${response.status}`);
    }
    const data = await response.json();

    if (!data.current || !data.hourly) {
        throw new Error("Open-Meteo response missing current or hourly data.");
    }

    const currentSpeed: CurrentWindInfo = {
      speed10m: Math.round(data.current.wind_speed_10m),
      unit: "kn",
      direction10m: degreesToCardinal(data.current.wind_direction_10m),
    };

    const forecast: WeatherDataPoint[] = [];
    const hourlyTimes = data.hourly.time;
    const hourlySpeeds = data.hourly.wind_speed_10m;
    const hourlyDirections = data.hourly.wind_direction_10m;

    // Open-Meteo provides hourly data. We need 2-hourly for FORECAST_DAYS.
    // FORECAST_DAYS * 24 hours = total hourly points. We'll take every 2nd point for 12 2-hourly points per day.
    for (let i = 0; i < hourlyTimes.length; i += 2) {
      if (forecast.length >= FORECAST_DAYS * 12) break; // Limit to points for FORECAST_DAYS

      const dateTime = new Date(hourlyTimes[i] * 1000);
      forecast.push({
        dateTime: dateTime,
        speed10m: Math.round(hourlySpeeds[i]),
        direction10m: degreesToCardinal(hourlyDirections[i]),
      });
    }
    
    return {
      currentSpeed,
      forecast,
      selectedApiName: "Open-Meteo (Live)", // Override AI selection name for clarity if live data is fetched
      reasoning: `Live data successfully fetched from Open-Meteo. ${aiSelection.reasoning}`,
    };

  } catch (error) {
    console.error("Error fetching or processing live Melville winds data:", error);
    // Fallback to a mock-like error structure
    const fallbackDate = new Date();
    const fallbackForecast: WeatherDataPoint[] = [];
    for (let i = 0; i < FORECAST_DAYS * 12; i++) { // FORECAST_DAYS, 12 2-hour intervals
        const dateTime = addHours(addDays(startOfDay(fallbackDate), Math.floor(i/12)), (i%12)*2);
        fallbackForecast.push({
            dateTime: dateTime,
            speed10m: 10 + Math.floor(Math.random() * 10), // Speed in knots
            direction10m: getRandomDirection(),
        });
    }
    return {
      currentSpeed: { speed10m: 15, unit: "kn", direction10m: "S" },
      forecast: fallbackForecast,
      selectedApiName: "Fallback Weather Service",
      reasoning: `Could not fetch live data from Open-Meteo (${error.message}). Displaying estimates. Original AI reason: ${aiSelection.reasoning}`,
    };
  }
}

