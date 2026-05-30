import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QrModal = ({ url, shortUrlId, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3 className="modal-title">QR Code</h3>
        <p className="modal-sub">{shortUrlId}</p>
        <div className="qr-wrapper">
          <QRCodeSVG
            value={url}
            size={200}
            bgColor="var(--bg)"
            fgColor="var(--text)"
            level="H"
            includeMargin={true}
          />
        </div>
        <p className="modal-url">{url}</p>
        <button
          className="btn btn-primary"
          onClick={() => {
            const svg = document.querySelector('.qr-wrapper svg');
            const svgData = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `qr-${shortUrlId}.svg`;
            link.click();
          }}
        >
          ⬇️ Download QR
        </button>
      </div>
    </div>
  );
};

const QrButton = ({ shortUrl, shortUrlId }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="icon-btn" title="QR Code" onClick={() => setOpen(true)}>⬛</button>
      {open && (
        <QrModal url={shortUrl} shortUrlId={shortUrlId} onClose={() => setOpen(false)} />
      )}
    </>
  );
};

export default QrButton;
