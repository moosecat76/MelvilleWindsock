
import type { LucideIcon } from 'lucide-react';
import { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, Cloudy } from 'lucide-react';

export const WIND_DIRECTIONS_ARRAY: string[] = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

export const COMPASS_DIRECTION_TO_DEGREES: { [key: string]: number } = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
};

export const DEFAULT_LUCIDE_NAVIGATION_ICON_BEARING = 45.0;


/**
 * Calculates the opposite compass direction.
 * @param direction The input compass direction (e.g., "NNE", representing where wind is coming FROM).
 * @returns The opposite compass direction (e.g., "SSW", representing where wind is blowing TOWARDS).
 */
export function getOppositeDirection(direction: string): string {
  const index = WIND_DIRECTIONS_ARRAY.indexOf(direction);
  if (index === -1) {
    return direction; // Should not happen with valid inputs
  }
  const oppositeIndex = (index + WIND_DIRECTIONS_ARRAY.length / 2) % WIND_DIRECTIONS_ARRAY.length;
  return WIND_DIRECTIONS_ARRAY[oppositeIndex];
}

/**
 * Converts wind direction from degrees to a 16-point cardinal direction string.
 * @param degrees The wind direction in degrees (0-360), where 0/360 is North. This is the direction wind is COMING FROM.
 * @returns The cardinal direction string (e.g., "N", "NNE", "SW").
 */
export function degreesToCardinal(degrees: number): string {
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  const index = Math.floor(((normalizedDegrees + 11.25) % 360) / 22.5);
  return WIND_DIRECTIONS_ARRAY[index];
}

// Used for fallback data generation in actions.ts
const windDirectionsFallback = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
export const getRandomDirectionFallback = (): string => {
    const randomIndex = Math.floor(Math.random() * windDirectionsFallback.length);
    return windDirectionsFallback[randomIndex];
};

interface WeatherInfo {
  icon: LucideIcon;
  description: string;
}

export function getWeatherIconAndDescription(weatherCode: number): WeatherInfo {
  switch (weatherCode) {
    case 0:
      return { icon: Sun, description: "Clear sky" };
    case 1:
      return { icon: CloudSun, description: "Mainly clear" };
    case 2:
      return { icon: Cloud, description: "Partly cloudy" };
    case 3:
      return { icon: Cloudy, description: "Overcast" }; // Using Cloudy for general overcast
    case 45:
    case 48:
      return { icon: CloudFog, description: "Fog" };
    case 51:
    case 53:
    case 55:
      return { icon: CloudDrizzle, description: "Drizzle" };
    case 56:
    case 57:
      return { icon: CloudDrizzle, description: "Freezing Drizzle" }; // Consider a specific icon if available/needed
    case 61:
    case 63:
    case 65:
      return { icon: CloudRain, description: "Rain" };
    case 66:
    case 67:
      return { icon: CloudRain, description: "Freezing Rain" }; // Consider a specific icon
    case 71:
    case 73:
    case 75:
      return { icon: CloudSnow, description: "Snow fall" };
    case 77:
      return { icon: CloudSnow, description: "Snow grains" };
    case 80:
    case 81:
    case 82:
      return { icon: CloudRain, description: "Rain showers" }; // Or differentiate more if needed
    case 85:
    case 86:
      return { icon: CloudSnow, description: "Snow showers" };
    case 95:
    case 96:
    case 99:
      return { icon: CloudLightning, description: "Thunderstorm" };
    default:
      return { icon: Cloud, description: "Cloudy" }; // Fallback for unknown codes
  }
}
