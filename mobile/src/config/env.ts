/**
 * Typed mobile environment variables.
 *
 * All EXPO_PUBLIC_* variables are read here and exported as a typed object.
 * App code imports from this module — never accesses process.env directly.
 *
 * Per ARCHITECTURE.md §8.2 — all mobile env vars are EXPO_PUBLIC_* prefixed.
 * Non-EXPO_PUBLIC_ vars are not accessible in the React Native bundle.
 */

import Constants from 'expo-constants';

function requirePublicEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    // In development, log a warning; in production the app will fail gracefully
    console.warn(`[config] Missing public environment variable: ${key}`);
    return '';
  }
  return value;
}

let apiUrl = requirePublicEnv('EXPO_PUBLIC_API_URL');

// Dynamically override localhost/LAN IPs during development to match the Expo Go host
if (__DEV__ && Constants.expoConfig?.hostUri) {
  const debuggerHost = Constants.expoConfig.hostUri.split(':')[0];
  if (debuggerHost) {
    // We assume the backend runs on port 5001. If the .env URL has a different port or path,
    // we just replace the host part. A simple regex replacement works well.
    apiUrl = apiUrl.replace(/^(https?:\/\/)([^:/]+)/, `$1${debuggerHost}`);
  }
}

const mobileEnv = {
  apiUrl,
  googlePlacesKey: requirePublicEnv('EXPO_PUBLIC_GOOGLE_PLACES_KEY'),
} as const;

export default mobileEnv;
