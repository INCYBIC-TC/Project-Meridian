import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import SectionContainer from '../components/SectionContainer';
import StatBox from '../components/StatBox';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Card from '../components/Card';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        setMetrics(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader fullPage message="Fetching dashboard metrics..." />;
  }

  // Helper to render custom SVG chart for scan durations
  const renderSVGChart = (recentScans) => {
    if (!recentScans || recentScans.length === 0) return null;

    // Show oldest to newest (left to right)
    const chronologicalScans = [...recentScans].reverse();
    const maxVal = Math.max(...chronologicalScans.map((s) => s.duration || 0), 100);
    
    const chartWidth = 700;
    const chartHeight = 120;
    const paddingLeft = 40;
    const paddingBottom = 20;
    const graphWidth = chartWidth - paddingLeft;
    const graphHeight = chartHeight - paddingBottom;
    
    const barSpacing = graphWidth / chronologicalScans.length;
    const barWidth = Math.max(barSpacing * 0.5, 12);

    return (
      <div style={{ marginTop: '12px' }}>
        <p style={{ 
          fontSize: '0.8rem', 
          fontWeight: 600, 
          color: 'var(--text-secondary)', 
          fontFamily: 'var(--font-heading)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '16px'
        }}>
          Scan Duration Trends (ms)
        </p>
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {/* Grid lines */}
          <line x1={paddingLeft} y1={0} x2={chartWidth} y2={0} stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
          <line x1={paddingLeft} y1={graphHeight / 2} x2={chartWidth} y2={graphHeight / 2} stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
          <line x1={paddingLeft} y1={graphHeight} x2={chartWidth} y2={graphHeight} stroke="var(--border)" strokeWidth="1" />

          {/* Y-Axis Label values */}
          <text x={paddingLeft - 8} y={5} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontFamily="var(--font-mono)">
            {Math.round(maxVal)}
          </text>
          <text x={paddingLeft - 8} y={graphHeight / 2 + 3} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontFamily="var(--font-mono)">
            {Math.round(maxVal / 2)}
          </text>
          <text x={paddingLeft - 8} y={graphHeight + 3} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontFamily="var(--font-mono)">
            0
          </text>

          {/* Chronological Bars */}
          {chronologicalScans.map((scan, i) => {
            const val = scan.duration || 0;
            const barHeight = maxVal > 0 ? (val / maxVal) * graphHeight : 0;
            const x = paddingLeft + i * barSpacing + (barSpacing - barWidth) / 2;
            const y = graphHeight - barHeight;
            const isFailed = scan.status === 'failed';
            
            return (
              <g key={scan._id} className="chart-bar-group">
                <title>{`${scan.repoId}: ${val}ms (${scan.status})`}</title>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 4)}
                  rx="3"
                  fill={isFailed ? 'var(--error)' : 'var(--primary)'}
                  style={{ opacity: 0.85, transition: 'opacity 0.15s ease' }}
                />
                {/* Micro-labels beneath bars */}
                <text 
                  x={x + barWidth / 2} 
                  y={chartHeight - 4} 
                  fill="var(--text-muted)" 
                  fontSize="8" 
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                >
                  {`#${chronologicalScans.length - i}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <SectionContainer className="fade-in">
      <header className="dashboard-header" style={{ marginBottom: '32px' }}>
        <h1 className="dashboard-title" style={{ fontSize: '2rem', fontWeight: 800 }}>
          Security & Docs Hub
        </h1>
        <p className="dashboard-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Real-time analysis pipeline metrics and scan status logs.
        </p>
      </header>

      {error && (
        <div className="alert alert-danger" role="alert">
          <span>{error}</span>
        </div>
      )}

      {metrics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* StatBoxes Grid */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <StatBox label="Total Scans" value={metrics.totalScans} color="var(--primary-hover)" />
            <StatBox label="Completed" value={metrics.completedScans} color="var(--success)" />
            <StatBox label="Failed" value={metrics.failedScans} color="var(--error)" />
            <StatBox label="Avg Duration" value={metrics.avgDuration ? `${metrics.avgDuration}ms` : '0ms'} />
          </div>

          {/* Minimal Duration Chart Card */}
          {metrics.recentScans && metrics.recentScans.length > 0 && (
            <Card title="Performance Analytics">
              {renderSVGChart(metrics.recentScans)}
            </Card>
          )}

          {/* Scan History Table Card */}
          <Card title="Recent Codebase Scans">
            {metrics.recentScans && metrics.recentScans.length > 0 ? (
              <Table headers={['Project ID', 'Triggered By', 'Started At', 'Duration', 'Status', 'Actions']}>
                {metrics.recentScans.map((scan) => (
                  <tr key={scan._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {scan.repoId}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {scan.triggeredBy || 'anonymous'}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(scan.startedAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      {scan.duration ? `${scan.duration}ms` : '-'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge status={scan.status}>{scan.status}</Badge>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {scan.status === 'completed' ? (
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                          <Link 
                            to={`/results/${scan._id}`} 
                            style={{ color: 'var(--primary-hover)', textDecoration: 'none', fontWeight: 600 }}
                          >
                            Results
                          </Link>
                          <Link 
                            to={`/security/${scan._id}`} 
                            style={{ color: 'var(--error)', textDecoration: 'none', fontWeight: 600 }}
                          >
                            Audit
                          </Link>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                No scan history. Go to "New Scan" to run your first codebase analysis.
              </div>
            )}
          </Card>
        </div>
      )}
    </SectionContainer>
  );
};

export default Dashboard;
