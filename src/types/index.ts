
export interface WeatherDataPoint {
  date: string; // Formatted for display, e.g., "Jul 20"
  fullDate: string; // Full date string, e.g., "2024-07-20"
  speed: number;
  direction: string; // e.g., "NW", "S", "ENE"
}

export interface CurrentWindInfo {
  speed: number;
  unit: string;
  direction: string; // e.g., "NW", "S", "ENE"
}

export interface FullWeatherData {
  currentSpeed: CurrentWindInfo;
  forecast: WeatherDataPoint[];
  selectedApiName: string;
  reasoning: string;
}

// This structure should align with WeatherApiSchema from select-weather-api.ts
export interface ApiDetails {
  name: string;
  description: string;
  accuracy: number; // 0-1
  recency: number; // in hours
  consistency: number; // 0-1
}
