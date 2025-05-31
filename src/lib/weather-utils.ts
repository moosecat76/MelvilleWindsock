
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
 * @param direction The input compass direction (e.g., "NNE", representing where wind is coming FROM or blowing TOWARDS).
 * @returns The opposite compass direction (e.g., "SSW").
 */
export function getOppositeDirection(direction: string): string {
  const index = WIND_DIRECTIONS_ARRAY.indexOf(direction);
  if (index === -1) {
    console.warn(`Invalid wind direction: ${direction}`);
    return direction; // Return original if not found
  }
  // For a 16-point compass, opposite is 8 positions away
  const oppositeIndex = (index + WIND_DIRECTIONS_ARRAY.length / 2) % WIND_DIRECTIONS_ARRAY.length;
  return WIND_DIRECTIONS_ARRAY[oppositeIndex];
}
