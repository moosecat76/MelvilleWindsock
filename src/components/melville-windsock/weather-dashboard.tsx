
"use client";

import React, { useState, useEffect } from 'react';
import { fetchMelvilleWindsData } from '@/app/actions';
import type { FullWeatherData } from '@/types';
import { AppHeader } from './app-header';
import { CurrentWindDisplay } from './current-wind-display';
import { ApiSelectionInfo } from './api-selection-info';
import { WindSpeedForecastChart } from './wind-speed-forecast-chart';
import { ForecastTable } from './forecast-table';
import { LoadingIndicator } from './loading-indicator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from '@/components/ui/button';

export function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<FullWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMelvilleWindsData();
      setWeatherData(data);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching data.");
      setWeatherData({
        currentSpeed: { speed: 0, unit: "km/h", direction: "N/A" },
        forecast: [],
        selectedApiName: "Error",
        reasoning: "Failed to load data from server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-body flex flex-col items-center">
      <div className="w-full max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        <AppHeader />

        {isLoading && <LoadingIndicator />}
        
        {error && !isLoading && (
          <Alert variant="destructive" className="shadow-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <Button onClick={loadData} variant="link" className="p-0 h-auto ml-2">Try again</Button>
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && weatherData && !error && (
          <div className="space-y-6 sm:space-y-8 transition-opacity duration-500 ease-in-out opacity-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <CurrentWindDisplay data={weatherData.currentSpeed} />
              <ApiSelectionInfo apiName={weatherData.selectedApiName} reasoning={weatherData.reasoning} />
            </div>
            <WindSpeedForecastChart data={weatherData.forecast} />
            <ForecastTable data={weatherData.forecast} />
          </div>
        )}
      </div>
      <footer className="w-full text-center py-4 mt-auto">
        <p className="text-sm text-muted-foreground">Melville Windsock &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
