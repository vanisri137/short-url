import React, { useState, useCallback } from 'react';
import UrlForm from '../components/UrlForm';
import UrlTable from '../components/UrlTable';
import Analytics from '../components/Analytics';
import CreatedUrlBanner from '../components/CreatedUrlBanner';
import { useUrls } from '../hooks/useUrls';
import { useAnalytics } from '../hooks/useAnalytics';

const Dashboard = () => {
  const [createdUrl, setCreatedUrl] = useState(null);
  const [analyticsRefresh, setAnalyticsRefresh] = useState(0);

  const { urls, pagination, loading, fetchUrls, createUrl, deleteUrl, toggleUrl } = useUrls();
  const { analytics, loading: analyticsLoading } = useAnalytics(analyticsRefresh);

  const handleCreated = useCallback(async (data) => {
    const newUrl = await createUrl(data);
    setCreatedUrl(newUrl);
    setAnalyticsRefresh((n) => n + 1);
    fetchUrls({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
  }, [createUrl, fetchUrls]);

  const handleDelete = useCallback(async (id) => {
    await deleteUrl(id);
    setAnalyticsRefresh((n) => n + 1);
  }, [deleteUrl]);

  return (
    <main className="dashboard">
      <div className="dashboard-inner">
        <UrlForm onCreated={handleCreated} />

        {createdUrl && (
          <CreatedUrlBanner urlData={createdUrl} onDismiss={() => setCreatedUrl(null)} />
        )}

        <Analytics analytics={analytics} loading={analyticsLoading} />

        <UrlTable
          urls={urls}
          pagination={pagination}
          loading={loading}
          onFetch={fetchUrls}
          onDelete={handleDelete}
          onToggle={toggleUrl}
        />
      </div>
    </main>
  );
};

export default Dashboard;
