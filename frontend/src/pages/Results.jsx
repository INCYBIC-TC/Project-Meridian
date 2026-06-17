import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import SectionContainer from '../components/SectionContainer';
import Card from '../components/Card';
import Tabs from '../components/Tabs';
import Badge from '../components/Badge';
import CodeBlock from '../components/CodeBlock';
import '../styles/results.css';

const Results = () => {
  const { scanId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('docs');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get(`/results/${scanId}`);
        setData(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch scan results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [scanId]);

  if (loading) {
    return <Loader fullPage message="Compiling analysis results..." />;
  }

  if (error || !data) {
    return (
      <SectionContainer>
        <div className="alert alert-danger" role="alert">
          <span>{error || 'No results available for this scan.'}</span>
        </div>
        <Link to="/dashboard" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </SectionContainer>
    );
  }

  const { scan, docs, reviews, tests, security } = data;

  // Dynamic AI Insight Generator (WOW factor - subtle and dynamic)
  const getAIInsightSummary = () => {
    const vulnCount = security?.vulnerabilities?.length || 0;
    const secretCount = security?.secrets?.length || 0;
    const codeSmellCount = reviews?.length || 0;

    if (vulnCount > 0 || secretCount > 0) {
      return {
        severity: 'high',
        title: 'AI Insight: Security Threats Identified',
        text: `Critical attention required. Analysis flagged ${vulnCount} vulnerabilities and ${secretCount} leaked credential targets. Verify the exposed keys and remove unsafe patterns (e.g. eval/subprocess shells) in the codebase immediately.`
      };
    }

    if (codeSmellCount > 0) {
      return {
        severity: 'medium',
        title: 'AI Insight: Structural Refactoring Recommended',
        text: `The codebase does not contain direct vulnerability patterns. However, ${codeSmellCount} structural recommendations have been flagged. Focus on applying sanitization utilities and improving error wrappers.`
      };
    }

    return {
      severity: 'safe',
      title: 'AI Insight: Codebase Meets Baseline Standards',
      text: 'Scan verified successfully. Source files conform to standard architecture guidelines, with no exposed credentials or vulnerability patterns identified.'
    };
  };

  const aiInsight = getAIInsightSummary();

  const tabItems = [
    { id: 'docs', label: 'Documentation' },
    { id: 'reviews', label: `AI Reviews (${reviews.length})` },
    { id: 'tests', label: `Automated Tests (${tests.length})` },
    { id: 'security', label: 'Security' }
  ];

  return (
    <SectionContainer className="fade-in">
      {/* Header Panel */}
      <header className="results-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '24px',
        marginBottom: '24px'
      }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pipeline Analysis
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>{scan.repoId}</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
            <Badge status={scan.status}>{scan.status}</Badge>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Started: <strong>{new Date(scan.startedAt).toLocaleString()}</strong>
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Duration: <strong>{scan.duration ? `${scan.duration}ms` : 'N/A'}</strong>
            </span>
          </div>
        </div>
        <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
          &larr; Dashboard
        </Link>
      </header>

      {/* AI Insight Summary Card */}
      <Card title={aiInsight.title} severity={aiInsight.severity}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>
          {aiInsight.text}
        </p>
      </Card>

      {/* Navigation Switcher */}
      <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

      {/* Content Panels */}
      <div className="tab-content">
        {activeTab === 'docs' && (
          <div className="doc-section fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card title="Architecture Overview">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {docs.summary || 'No documentation summary was written for this codebase.'}
              </p>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              <Card title="Discovered API Endpoints">
                {docs.routes && docs.routes.length > 0 ? (
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none' }}>
                    {docs.routes.map((route, i) => (
                      <li key={i} style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.85rem', 
                        color: 'var(--text-secondary)',
                        padding: '8px 12px',
                        backgroundColor: 'rgba(10, 14, 18, 0.4)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px'
                      }}>
                        {typeof route === 'object' ? `${route.method} ${route.path}` : route}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No routes detected.</p>
                )}
              </Card>

              <Card title="Data Models & Schemas">
                {docs.models && docs.models.length > 0 ? (
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none' }}>
                    {docs.models.map((model, i) => (
                      <li key={i} style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontSize: '0.85rem', 
                        color: 'var(--text-secondary)',
                        padding: '8px 12px',
                        backgroundColor: 'rgba(10, 14, 18, 0.4)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px'
                      }}>
                        {typeof model === 'object' ? `${model.name} (${model.type || 'schema'})` : model}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No models detected.</p>
                )}
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.length > 0 ? (
              reviews.map((comment, index) => (
                <Card 
                  key={index} 
                  title={`${comment.file}:${comment.line}`} 
                  severity={comment.severity}
                  collapsible
                  defaultCollapsed={index > 0} // Collapse all except first for scannability
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Location: line {comment.line}
                    </span>
                    <Badge status={comment.severity}>{comment.severity}</Badge>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.9rem' }}>
                    {comment.message}
                  </p>
                </Card>
              ))
            ) : (
              <Card title="AI Review Verification">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No codebase structural issues identified.</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {tests.length > 0 ? (
              tests.map((testCase, index) => (
                <Card 
                  key={index} 
                  title={testCase.name} 
                  headerAction={<span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{testCase.file}</span>}
                  collapsible
                  defaultCollapsed={index > 0} // Progressive disclosure
                >
                  <CodeBlock code={testCase.testCode} language="python" />
                </Card>
              ))
            ) : (
              <Card title="Test Suite Verification">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No test suites generated for this repository.</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card title="Vulnerability Overview">
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <div style={{
                  flex: 1,
                  padding: '16px',
                  backgroundColor: 'rgba(10, 14, 18, 0.4)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--error)' }}>
                    {security.vulnerabilities ? security.vulnerabilities.length : 0}
                  </div>
                  <span className="input-label" style={{ fontSize: '0.7rem' }}>Vulnerabilities</span>
                </div>

                <div style={{
                  flex: 1,
                  padding: '16px',
                  backgroundColor: 'rgba(10, 14, 18, 0.4)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)' }}>
                    {security.secrets ? security.secrets.length : 0}
                  </div>
                  <span className="input-label" style={{ fontSize: '0.7rem' }}>Secrets</span>
                </div>

                <div style={{
                  flex: 1,
                  padding: '16px',
                  backgroundColor: 'rgba(10, 14, 18, 0.4)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-hover)' }}>
                    {security.owaspFlags ? security.owaspFlags.length : 0}
                  </div>
                  <span className="input-label" style={{ fontSize: '0.7rem' }}>OWASP Flags</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '10px' }}>Security Audit Executive Summary</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '20px' }}>
                  {security.summary || 'No audit summary generated.'}
                </p>
                <Link to={`/security/${scanId}`} className="btn btn-primary" style={{ background: 'var(--error)' }}>
                  View Full Audit Log &rarr;
                </Link>
              </div>
            </Card>
          </div>
        )}
      </div>
    </SectionContainer>
  );
};

export default Results;
