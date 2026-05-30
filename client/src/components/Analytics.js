import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

const StatCard = ({ icon, label, value, sub }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-body">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

const Analytics = ({ analytics, loading }) => {
  if (loading) return <div className="analytics-loading">Loading analytics…</div>;
  if (!analytics) return null;

  const chartData = analytics.topUrls.map((u) => ({
    name: u.shortUrlId,
    clicks: u.clicks,
  }));

  return (
    <div className="analytics-section">
      <h2 className="section-title">📊 Analytics Overview</h2>

      <div className="stats-grid">
        <StatCard icon="🔗" label="Total URLs" value={analytics.totalUrls.toLocaleString()} />
        <StatCard icon="👆" label="Total Clicks" value={analytics.totalClicks.toLocaleString()} />
        <StatCard
          icon="📈"
          label="Avg Clicks / URL"
          value={analytics.avgClicks}
          sub="per shortened URL"
        />
        <StatCard
          icon="🏆"
          label="Top URL"
          value={analytics.topUrls[0]?.shortUrlId || '—'}
          sub={`${analytics.topUrls[0]?.clicks || 0} clicks`}
        />
      </div>

      {chartData.length > 0 && (
        <div className="card chart-card">
          <h3 className="chart-title">Top 5 Most Clicked URLs</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                }}
              />
              <Bar dataKey="clicks" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Analytics;
