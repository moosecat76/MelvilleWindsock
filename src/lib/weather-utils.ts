
export const WIND_DIRECTIONS_ARRAY: string[] = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

export const COMPASS_DIRECTION_TO_DEGREES: { [key: string]: number } = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
};

// The lucide-react Navigation icon, when unrotated (transform: rotate(0deg)),
// visually points towards ESE (East-South-East), which is 112.5 degrees.
// This value is derived from observing that a CSS rotation of 202.5deg
// (seen in inspector) results in a visual orientation of NW (315deg) on the chart.
// (DEFAULT_BEARING + 202.5) % 360 = 315  => DEFAULT_BEARING = (315 - 202.5 + 360) % 360 = 112.5.
export const DEFAULT_LUCIDE_NAVIGATION_ICON_BEARING = 112.5;


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
  // Each of the 16 directions covers 360/16 = 22.5 degrees.
  // We add 0.5 * 22.5 = 11.25 to the degrees to center the "slice" for each direction,
  // then divide by 22.5 to get the index.
  const index = Math.floor(((normalizedDegrees + 11.25) % 360) / 22.5);
  return WIND_DIRECTIONS_ARRAY[index];
}

// Used for fallback data generation in actions.ts
const windDirectionsFallback = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
export const getRandomDirectionFallback = (): string => {
    const randomIndex = Math.floor(Math.random() * windDirectionsFallback.length);
    return windDirectionsFallback[randomIndex];
};

