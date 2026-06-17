import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import SectionContainer from '../components/SectionContainer';
import Card from '../components/Card';
import Badge from '../components/Badge';

const Security = () => {
  const { scanId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSecurityReport = async () => {
      try {
        const response = await api.get(`/security/${scanId}`);
        setReport(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch security report.');
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityReport();
  }, [scanId]);

  if (loading) {
    return <Loader fullPage message="Analyzing security reports..." />;
  }

  if (error || !report) {
    return (
      <SectionContainer>
        <div className="alert alert-danger" role="alert">
          <span>{error || 'No security report available.'}</span>
        </div>
        <Link to={`/results/${scanId}`} className="btn btn-secondary">
          Back to Scan Results
        </Link>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer className="fade-in">
      <header className="results-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '24px',
        marginBottom: '24px'
      }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--error)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🔒 SECURITY AUDIT DETAILS
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>Security Vulnerabilities Log</h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Scan Identification: <strong>{report.scanId}</strong>
          </span>
        </div>
        <Link to={`/results/${scanId}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
          &larr; Back to Results
        </Link>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Vulnerabilities Section */}
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-heading)', color: 'var(--error)' }}>
            Detected Vulnerabilities ({report.vulnerabilities ? report.vulnerabilities.length : 0})
          </h2>
          {report.vulnerabilities && report.vulnerabilities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {report.vulnerabilities.map((vuln, i) => (
                <Card 
                  key={i} 
                  title={vuln.type || 'Vulnerability Pattern'} 
                  severity="critical"
                  headerAction={<Badge status="critical">{vuln.severity || 'CRITICAL'}</Badge>}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>Location: {vuln.file ? `${vuln.file}:${vuln.line || 0}` : 'Global codebase'}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.9rem' }}>
                    {vuln.message || 'No description provided.'}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No code pattern vulnerabilities detected.</p>
            </Card>
          )}
        </div>

        {/* Leaked Secrets Section */}
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', fontFamily: 'var(--font-heading)', color: 'var(--warning)' }}>
            Exposed Credentials & Tokens ({report.secrets ? report.secrets.length : 0})
          </h2>
          {report.secrets && report.secrets.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {report.secrets.map((secret, i) => (
                <Card 
                  key={i} 
                  title={secret.key || 'Exposed credential'} 
                  severity="medium"
                  headerAction={<Badge status="warning">EXPOSED</Badge>}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>Location: {secret.file}:{secret.line}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    Target Token Field: <strong>{secret.key}</strong>
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No exposed private keys or api tokens found.</p>
            </Card>
          )}
        </div>

        {/* OWASP & Dependency flags grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* OWASP Violations */}
          <Card title="OWASP Security Safeguards">
            {report.owaspFlags && report.owaspFlags.length > 0 ? (
              <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {report.owaspFlags.map((flag, i) => (
                  <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.4 }}>
                    {flag}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No OWASP safeguard warnings flagged.</p>
            )}
          </Card>

          {/* Dependency Vulnerability Flags */}
          <Card title="Third-Party Dependencies">
            {report.dependencyFlags && report.dependencyFlags.length > 0 ? (
              <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {report.dependencyFlags.map((flag, i) => (
                  <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.4 }}>
                    {flag}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>All declared packages are secure.</p>
            )}
          </Card>
        </div>
      </div>
    </SectionContainer>
  );
};

export default Security;
