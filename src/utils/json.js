/**
 * Safely parse a JSON string with a fallback value.
 * Never throws an exception under any circumstance.
 *
 * @param {any} value - The value to parse (if already an object, returns it; if null/empty/invalid, returns fallback).
 * @param {any} [fallback={}] - The default value to return on failure.
 * @returns {any}
 */
export function safeParseJson(value, fallback = {}) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  if (typeof value === 'object') {
    return value;
  }
  if (typeof value !== 'string') {
    return fallback;
  }
  try {
    const parsed = JSON.parse(value);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}
