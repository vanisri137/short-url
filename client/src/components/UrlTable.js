import React, { useState, useEffect, useCallback } from 'react';
import { formatDate, truncateUrl, copyToClipboard, getStatusBadge } from '../utils/helpers';
import QrButton from './QrButton';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'clicks', label: 'Clicks' },
  { value: 'lastAccessed', label: 'Last Accessed' },
  { value: 'originalUrl', label: 'URL' },
];

const UrlTable = ({ urls, pagination, loading, onFetch, onDelete, onToggle }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(() => {
    onFetch({ search, sortBy, sortOrder, page, limit: 10 });
  }, [search, sortBy, sortOrder, page, onFetch]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 1 when search/sort changes
  useEffect(() => {
    setPage(1);
  }, [search, sortBy, sortOrder]);

  const handleCopy = async (id, shortUrl) => {
    await copyToClipboard(shortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this URL? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="sort-icon">⇅</span>;
    return <span className="sort-icon active">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="table-section">
      <div className="table-header">
        <h2 className="section-title">🔗 Your URLs</h2>
        <div className="table-controls">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search URLs, aliases…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-input sort-select"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [f, o] = e.target.value.split('-');
              setSortBy(f);
              setSortOrder(o);
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <React.Fragment key={o.value}>
                <option value={`${o.value}-desc`}>{o.label} ↓</option>
                <option value={`${o.value}-asc`}>{o.label} ↑</option>
              </React.Fragment>
            ))}
          </select>
        </div>
      </div>

      <div className="card table-card">
        {loading ? (
          <div className="table-loading">
            <div className="spinner large" />
            <span>Loading URLs…</span>
          </div>
        ) : urls.length === 0 ? (
          <div className="table-empty">
            <div className="empty-icon">🔗</div>
            <p>{search ? 'No URLs match your search.' : 'No URLs yet. Create your first one above!'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="url-table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort('originalUrl')} className="sortable">
                    Original URL <SortIcon field="originalUrl" />
                  </th>
                  <th>Short URL</th>
                  <th onClick={() => toggleSort('clicks')} className="sortable">
                    Clicks <SortIcon field="clicks" />
                  </th>
                  <th onClick={() => toggleSort('createdAt')} className="sortable">
                    Created <SortIcon field="createdAt" />
                  </th>
                  <th onClick={() => toggleSort('lastAccessed')} className="sortable">
                    Last Accessed <SortIcon field="lastAccessed" />
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url) => {
                  const badge = getStatusBadge(url);
                  return (
                    <tr key={url._id} className={!url.isActive ? 'row-inactive' : ''}>
                      <td>
                        <a
                          href={url.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="url-link"
                          title={url.originalUrl}
                        >
                          {truncateUrl(url.originalUrl, 45)}
                        </a>
                      </td>
                      <td>
                        <a
                          href={url.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="short-link"
                        >
                          {url.shortUrlId}
                        </a>
                        {url.customAlias && (
                          <span className="alias-tag">alias</span>
                        )}
                      </td>
                      <td>
                        <span className="click-badge">{url.clicks.toLocaleString()}</span>
                      </td>
                      <td className="date-cell">{formatDate(url.createdAt)}</td>
                      <td className="date-cell">{url.lastAccessed ? formatDate(url.lastAccessed) : '—'}</td>
                      <td>
                        <span className={`badge ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className={`icon-btn copy-btn ${copiedId === url._id ? 'copied' : ''}`}
                            title={copiedId === url._id ? 'Copied!' : 'Copy short URL'}
                            onClick={() => handleCopy(url._id, url.shortUrl)}
                          >
                            {copiedId === url._id ? '✅' : '📋'}
                          </button>

                          <QrButton shortUrl={url.shortUrl} shortUrlId={url.shortUrlId} />

                          <button
                            className="icon-btn"
                            title={url.isActive ? 'Deactivate' : 'Activate'}
                            onClick={() => onToggle(url._id)}
                          >
                            {url.isActive ? '🔴' : '🟢'}
                          </button>

                          <button
                            className="icon-btn delete-btn"
                            title="Delete"
                            onClick={() => handleDelete(url._id)}
                            disabled={deletingId === url._id}
                          >
                            {deletingId === url._id ? <span className="spinner small" /> : '🗑️'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span className="page-info">
              Page {pagination.page} of {pagination.totalPages}
              <span className="total-count"> ({pagination.total} total)</span>
            </span>
            <button
              className="btn btn-ghost"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlTable;
