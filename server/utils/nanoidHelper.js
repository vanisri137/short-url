/**
 * NanoID utility for collision-free short URL ID generation.
 *
 * Collision handling strategy:
 * 1. Generate a candidate ID using NanoID (alphanumeric, length 7)
 * 2. Query MongoDB to check if the ID already exists
 * 3. If collision detected, retry up to MAX_RETRIES times
 * 4. On repeated failures, increase ID length to reduce probability space
 *
 * With alphabet of 62 chars and length 7: 62^7 = ~3.5 trillion combinations
 * Collision probability at 1M entries ≈ 0.00014% — effectively zero.
 */

const Url = require('../models/Url');

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const DEFAULT_LENGTH = 7;
const MAX_RETRIES = 5;

let nanoid;

// Lazy-load nanoid (ES Module)
const getNanoid = async () => {
  if (!nanoid) {
    const { customAlphabet } = await import('nanoid');
    nanoid = customAlphabet(ALPHABET, DEFAULT_LENGTH);
  }
  return nanoid;
};

/**
 * Generates a unique short URL ID with retry logic.
 * @param {number} length - Optional custom length (defaults to DEFAULT_LENGTH)
 * @returns {Promise<string>} - Unique short URL ID
 */
const generateUniqueId = async (length = DEFAULT_LENGTH) => {
  const generate = await getNanoid();
  let attempts = 0;
  let currentLength = length;

  while (attempts < MAX_RETRIES) {
    // Generate candidate using NanoID
    const { customAlphabet } = await import('nanoid');
    const gen = customAlphabet(ALPHABET, currentLength);
    const candidate = gen();

    // Check for collision in MongoDB
    const existing = await Url.findOne({ shortUrlId: candidate }).lean();

    if (!existing) {
      // No collision — safe to use
      return candidate;
    }

    attempts++;
    console.warn(`⚠️ NanoID collision detected for "${candidate}". Attempt ${attempts}/${MAX_RETRIES}`);

    // After half retries, increase length to reduce collision probability
    if (attempts >= Math.floor(MAX_RETRIES / 2)) {
      currentLength = currentLength + 1;
      console.info(`📏 Increasing ID length to ${currentLength} to reduce collision probability`);
    }
  }

  throw new Error('Failed to generate a unique short URL ID after maximum retries. This is extremely rare.');
};

/**
 * Validates a custom alias for uniqueness and format.
 * @param {string} alias
 * @returns {Promise<{valid: boolean, reason?: string}>}
 */
const validateAlias = async (alias) => {
  if (!alias) return { valid: false, reason: 'Alias is empty' };

  // Only allow alphanumeric, hyphen, underscore (3–30 chars)
  const aliasRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  if (!aliasRegex.test(alias)) {
    return {
      valid: false,
      reason: 'Alias must be 3–30 characters and contain only letters, numbers, hyphens, or underscores',
    };
  }

  const existing = await Url.findOne({ shortUrlId: alias }).lean();
  if (existing) {
    return { valid: false, reason: 'This alias is already taken' };
  }

  return { valid: true };
};

module.exports = { generateUniqueId, validateAlias };
