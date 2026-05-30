import React, { useState } from 'react';
import { copyToClipboard } from '../utils/helpers';
import QrButton from './QrButton';

const CreatedUrlBanner = ({ urlData, onDismiss }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(urlData.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="created-banner">
      <div className="banner-header">
        <span className="banner-icon">🎉</span>
        <span className="banner-title">URL Shortened!</span>
        <button className="banner-close" onClick={onDismiss}>✕</button>
      </div>
      <div className="banner-body">
        <div className="short-url-display">
          <a href={urlData.shortUrl} target="_blank" rel="noopener noreferrer" className="banner-short-url">
            {urlData.shortUrl}
          </a>
        </div>
        <div className="banner-actions">
          <button className={`btn btn-primary ${copied ? 'btn-success' : ''}`} onClick={handleCopy}>
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
          <QrButton shortUrl={urlData.shortUrl} shortUrlId={urlData.shortUrlId} />
          <a href={urlData.shortUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            🔗 Open
          </a>
        </div>
      </div>
    </div>
  );
};

export default CreatedUrlBanner;
