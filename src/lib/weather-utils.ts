
export const WIND_DIRECTIONS_ARRAY: string[] = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

export const COMPASS_DIRECTION_TO_DEGREES: { [key: string]: number } = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
};

/**
 * Calculates the direction the wind is coming from, given the direction it's blowing towards.
 * @param blowingToDirection The direction the wind is blowing towards (e.g., "NNE").
 * @returns The direction the wind is coming from (e.g., "SSW").
 */
export function getWindOriginDirection(blowingToDirection: string): string {
  const index = WIND_DIRECTIONS_ARRAY.indexOf(blowingToDirection);
  if (index === -1) {
    console.warn(`Invalid wind direction: ${blowingToDirection}`);
    return blowingToDirection; // Return original if not found, though this shouldn't happen with valid data
  }
  const oppositeIndex = (index + 8) % 16; // 8 positions = 180 degrees opposite
  return WIND_DIRECTIONS_ARRAY[oppositeIndex];
}
