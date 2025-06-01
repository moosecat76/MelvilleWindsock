
// @ts-nocheck
// TODO: Remove @ts-nocheck and fix type errors
"use server";

import { selectWeatherApi, type SelectWeatherApiInput } from '@/ai/flows/select-weather-api';
import type { FullWeatherData, ApiDetails, WeatherDataPoint, CurrentWindInfo, DailyForecastSummary } from '@/types';
import { degreesToCardinal, getRandomDirectionFallback as getRandomDirection } from '@/lib/weather-utils';
import { format, addHours, startOfDay, addDays, parseISO } from 'date-fns';

const mockApis: ApiDetails[] = [
  { name: "OpenMeteoX", description: "Advanced open-source API with high resolution.", accuracy: 0.92, recency: 0.5, consistency: 0.95 },
  { name: "WAWeatherGov", description: "Official Western Australia government data, updated frequently.", accuracy: 0.88, recency: 1, consistency: 0.98 },
  { name: "WindyPro", description: "Professional grade API, broad coverage.", accuracy: 0.90, recency: 2, consistency: 0.90 },
  { name: "LocalSensorNet", description: "Hyperlocal sensor network data, very recent but can be noisy.", accuracy: 0.75, recency: 0.25, consistency: 0.70 },
];

const MELVILLE_LAT = -32.00;
const MELVILLE_LON = 115.82;
const FORECAST_DAYS = 7;

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
    const dailyParams = "weather_code,temperature_2m_max,temperature_2m_min";
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${MELVILLE_LAT}&longitude=${MELVILLE_LON}&current=wind_speed_10m,wind_direction_10m&hourly=wind_speed_10m,wind_direction_10m&daily=${dailyParams}&wind_speed_unit=kn&timeformat=unixtime&forecast_days=${FORECAST_DAYS}`;
    
    const response = await fetch(openMeteoUrl, { next: { revalidate: 3600 } });
    if (!response.ok) {
      throw new Error(`Open-Meteo API request failed with status ${response.status}`);
    }
    const data = await response.json();

    if (!data.current || !data.hourly || !data.daily) {
        throw new Error("Open-Meteo response missing current, hourly, or daily data.");
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

    for (let i = 0; i < hourlyTimes.length; i += 2) {
      if (forecast.length >= FORECAST_DAYS * 12) break; 

      const dateTime = new Date(hourlyTimes[i] * 1000);
      forecast.push({
        dateTime: dateTime,
        speed10m: Math.round(hourlySpeeds[i]),
        direction10m: degreesToCardinal(hourlyDirections[i]),
      });
    }

    const dailySummary: DailyForecastSummary[] = [];
    const dailyTimes = data.daily.time; // These are strings like "2024-07-25"
    const dailyWeatherCodes = data.daily.weather_code;
    const dailyTempMax = data.daily.temperature_2m_max;
    const dailyTempMin = data.daily.temperature_2m_min;

    for (let i = 0; i < dailyTimes.length; i++) {
      dailySummary.push({
        date: parseISO(dailyTimes[i]), // Open-Meteo returns YYYY-MM-DD strings for daily time
        tempMin: Math.round(dailyTempMin[i]),
        tempMax: Math.round(dailyTempMax[i]),
        weatherCode: dailyWeatherCodes[i],
      });
    }
    
    return {
      currentSpeed,
      forecast,
      dailySummary,
      selectedApiName: "Open-Meteo (Live)",
      reasoning: `Live data successfully fetched from Open-Meteo. ${aiSelection.reasoning}`,
    };

  } catch (error) {
    console.error("Error fetching or processing live Melville winds data:", error);
    const fallbackDate = new Date();
    const fallbackForecast: WeatherDataPoint[] = [];
    for (let i = 0; i < FORECAST_DAYS * 12; i++) { 
        const dateTime = addHours(addDays(startOfDay(fallbackDate), Math.floor(i/12)), (i%12)*2);
        fallbackForecast.push({
            dateTime: dateTime,
            speed10m: 10 + Math.floor(Math.random() * 10),
            direction10m: getRandomDirection(),
        });
    }
    const fallbackDailySummary: DailyForecastSummary[] = [];
    for (let i = 0; i < FORECAST_DAYS; i++) {
        fallbackDailySummary.push({
            date: addDays(startOfDay(fallbackDate), i),
            tempMin: 10 + Math.floor(Math.random() * 5),
            tempMax: 20 + Math.floor(Math.random() * 5),
            weatherCode: Math.floor(Math.random() * 4), // Mock codes 0-3
        });
    }
    return {
      currentSpeed: { speed10m: 15, unit: "kn", direction10m: "S" },
      forecast: fallbackForecast,
      dailySummary: fallbackDailySummary,
      selectedApiName: "Fallback Weather Service",
      reasoning: `Could not fetch live data from Open-Meteo (${error.message}). Displaying estimates. Original AI reason: ${aiSelection.reasoning}`,
    };
  }
}
