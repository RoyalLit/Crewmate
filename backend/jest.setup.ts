/**
 * Jest global setup file.
 *
 * Runs before any test module is loaded (jest `setupFiles` phase).
 * Sets required environment variables so that env.ts module-level
 * validation succeeds when test files import app modules.
 *
 * These are test-only values — they are not real secrets.
 */

process.env['NODE_ENV'] = 'development';
process.env['PORT'] = '5001';
process.env['MONGO_URI'] = 'mongodb://localhost:27017/crewmute_test';
// Minimum-length test secrets — not used in real operations
process.env['ACCESS_TOKEN_SECRET'] =
  'test_access_secret_minimum_64_chars_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
process.env['REFRESH_TOKEN_SECRET'] =
  'test_refresh_secret_minimum_64_chars_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
