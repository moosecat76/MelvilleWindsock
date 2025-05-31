
export const WIND_DIRECTIONS_ARRAY: string[] = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

export const COMPASS_DIRECTION_TO_DEGREES: { [key: string]: number } = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
};

// The lucide-react Navigation icon points North-West (NW) by default.
// NW corresponds to 315 degrees on a standard compass.
export const DEFAULT_LUCIDE_NAVIGATION_ICON_BEARING = 315;


/**
 * Calculates the opposite compass direction.
 * @param direction The input compass direction (e.g., "NNE", representing where wind is coming FROM).
 * @returns The opposite compass direction (e.g., "SSW", representing where wind is blowing TOWARDS).
 */
export function getOppositeDirection(direction: string): string {
  const index = WIND_DIRECTIONS_ARRAY.indexOf(direction);
  if (index === -1) {
    // console.warn(`Invalid wind direction for opposite calculation: ${direction}`);
    return direction;
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
  const index = Math.floor((normalizedDegrees / 22.5) + 0.5) % 16;
  return WIND_DIRECTIONS_ARRAY[index];
}

// Used for fallback data generation in actions.ts
const windDirectionsFallback = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
export const getRandomDirectionFallback = (): string => {
    const randomIndex = Math.floor(Math.random() * windDirectionsFallback.length);
    return windDirectionsFallback[randomIndex];
};
