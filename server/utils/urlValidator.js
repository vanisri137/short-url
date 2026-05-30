/**
 * URL validation utilities.
 * Ensures only well-formed, accessible URLs are shortened.
 */

const BLOCKED_PATTERNS = [
  /^localhost/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^0\.0\.0\.0/,
];

/**
 * Validates a URL string.
 * Rejects: plain words, IPs in private ranges, missing protocol.
 * Accepts: valid http/https URLs with proper hostname.
 */
const isValidUrl = (urlString) => {
  try {
    const url = new URL(urlString);

    // Must use http or https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, reason: 'URL must use http or https protocol' };
    }

    // Must have a real hostname (not just 'google' — needs at least one dot or be valid TLD)
    const hostname = url.hostname;
    if (!hostname || hostname.length < 3) {
      return { valid: false, reason: 'Invalid hostname' };
    }

    // Reject plain words without TLD (e.g. "google", "test", "abc")
    if (!/\.[a-z]{2,}$/i.test(hostname)) {
      return { valid: false, reason: 'URL must have a valid domain (e.g. https://google.com)' };
    }

    // Block private/loopback IP ranges
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(hostname)) {
        return { valid: false, reason: 'Private or loopback IP addresses are not allowed' };
      }
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      reason: 'Invalid URL format. Example: https://google.com',
    };
  }
};

/**
 * Sanitizes URL by ensuring it has a protocol.
 */
const sanitizeUrl = (urlString) => {
  const trimmed = urlString.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

module.exports = { isValidUrl, sanitizeUrl };
