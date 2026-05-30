/**
 * Format a date string to a readable format.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Truncate a URL for display.
 */
export const truncateUrl = (url, maxLen = 50) => {
  if (!url) return '';
  return url.length > maxLen ? `${url.substring(0, maxLen)}...` : url;
};

/**
 * Copy text to clipboard and return success bool.
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
};

/**
 * Returns badge color class for URL status.
 */
export const getStatusBadge = (url) => {
  if (!url.isActive) return { label: 'Inactive', cls: 'badge-inactive' };
  if (url.isExpired || (url.expiresAt && new Date() > new Date(url.expiresAt))) {
    return { label: 'Expired', cls: 'badge-expired' };
  }
  return { label: 'Active', cls: 'badge-active' };
};
