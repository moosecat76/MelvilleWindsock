
export interface WeatherDataPoint {
  dateTime: Date; // Precise date and time for the forecast point
  speed10m: number; // Wind speed at 10 meters
  direction10m: string; // Wind direction at 10 meters (e.g., "NW", "S", "ENE") - direction FROM
}

export interface CurrentWindInfo {
  speed10m: number; // Wind speed at 10 meters
  unit: string;
  direction10m: string; // Wind direction at 10 meters (e.g., "NW", "S", "ENE") - direction FROM
}

export interface DailyForecastSummary {
  date: Date;
  tempMin: number;
  tempMax: number;
  weatherCode: number;
}

export interface FullWeatherData {
  currentSpeed: CurrentWindInfo;
  forecast: WeatherDataPoint[];
  dailySummary: DailyForecastSummary[];
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
