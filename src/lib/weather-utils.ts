
export const WIND_DIRECTIONS_ARRAY: string[] = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

export const COMPASS_DIRECTION_TO_DEGREES: { [key: string]: number } = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
};

/**
 * Calculates the opposite compass direction.
 * @param direction The input compass direction (e.g., "NNE", representing where wind is coming FROM).
 * @returns The opposite compass direction (e.g., "SSW", representing where wind is blowing TOWARDS).
 */
export function getOppositeDirection(direction: string): string {
  const index = WIND_DIRECTIONS_ARRAY.indexOf(direction);
  if (index === -1) {
    // console.warn(`Invalid wind direction for opposite calculation: ${direction}`);
    return direction; // Return original if not found, though degreesToCardinal should prevent this.
  }
  // For a 16-point compass, opposite is 8 positions away
  const oppositeIndex = (index + WIND_DIRECTIONS_ARRAY.length / 2) % WIND_DIRECTIONS_ARRAY.length;
  return WIND_DIRECTIONS_ARRAY[oppositeIndex];
}

/**
 * Converts wind direction from degrees to a 16-point cardinal direction string.
 * @param degrees The wind direction in degrees (0-360), where 0/360 is North.
 * @returns The cardinal direction string (e.g., "N", "NNE", "SW").
 */
export function degreesToCardinal(degrees: number): string {
  const normalizedDegrees = ((degrees % 360) + 360) % 360; // Ensure degrees are within 0-360
  // Each of the 16 sectors is 22.5 degrees wide (360 / 16).
  // We add 0.5 to round to the nearest sector center before flooring.
  // E.g., 0-11.25 is N, 11.25-33.75 is NNE.
  // (0 / 22.5) + 0.5 = 0.5 -> floor = 0 (N)
  // (12 / 22.5) + 0.5 = 0.53 + 0.5 = 1.03 -> floor = 1 (NNE)
  // (350 / 22.5) + 0.5 = 15.55 + 0.5 = 16.05 -> floor = 16. 16 % 16 = 0 (N). This is correct as 350 is closer to N.
  const index = Math.floor((normalizedDegrees / 22.5) + 0.5) % 16;
  return WIND_DIRECTIONS_ARRAY[index];
}

// Used for fallback data generation in actions.ts
const windDirectionsFallback = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
export const getRandomDirection = (): string => {
    // This function is client-side if used in a useEffect, server-side if in a server action.
    // Ensure Math.random() behaves as expected in the execution context.
    const randomIndex = Math.floor(Math.random() * windDirectionsFallback.length);
    return windDirectionsFallback[randomIndex];
};
