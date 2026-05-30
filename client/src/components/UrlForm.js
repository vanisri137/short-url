import React, { useState } from 'react';

const UrlForm = ({ onCreated }) => {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    setLoading(true);
    try {
      await onCreated({ url: url.trim(), customAlias: customAlias.trim() || undefined, expiresAt: expiresAt || undefined });
      setUrl('');
      setCustomAlias('');
      setExpiresAt('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setCustomAlias('');
    setExpiresAt('');
    setError('');
  };

  // Min date for expiry input (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  return (
    <div className="card form-card">
      <div className="card-header">
        <div className="card-icon">✂️</div>
        <div>
          <h2 className="card-title">Shorten a URL</h2>
          <p className="card-subtitle">Paste your long URL and get a short one instantly</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="url-form">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label className="form-label" htmlFor="url">Long URL *</label>
          <input
            id="url"
            type="text"
            className="form-input"
            placeholder="https://your-very-long-url.com/with/a/long/path"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="alias">Custom Alias <span className="optional">(optional)</span></label>
            <div className="alias-input-wrapper">
              <span className="alias-prefix">short/</span>
              <input
                id="alias"
                type="text"
                className="form-input alias-input"
                placeholder="my-custom-link"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                disabled={loading}
                maxLength={30}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="expires">Expiration Date <span className="optional">(optional)</span></label>
            <input
              id="expires"
              type="datetime-local"
              className="form-input"
              value={expiresAt}
              min={minDate}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading || !url.trim()}>
            {loading ? <span className="spinner" /> : '✂️'} &nbsp;
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={loading}>
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default UrlForm;
