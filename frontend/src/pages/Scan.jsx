import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import SectionContainer from '../components/SectionContainer';
import Card from '../components/Card';
import '../styles/scan.css';

const Scan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [repoId, setRepoId] = useState('');
  const [triggeredBy, setTriggeredBy] = useState(user?.email || '');
  const [files, setFiles] = useState([
    { path: 'main.py', content: 'def process_data(user_input):\n    # TODO: sanitize input before execution\n    eval(user_input)\n' }
  ]);
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddFile = () => {
    setFiles([...files, { path: '', content: '' }]);
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, idx) => idx !== index);
    setFiles(updatedFiles);
  };

  const handleFileChange = (index, field, value) => {
    const updatedFiles = files.map((file, idx) => {
      if (idx === index) {
        return { ...file, [field]: value };
      }
      return file;
    });
    setFiles(updatedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payloadFiles = files.filter(f => f.path.trim() || f.content.trim());

    if (payloadFiles.length === 0) {
      setError('Please add at least 1 file with a valid path and content.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await api.post('/scan/init', {
        repoId,
        triggeredBy,
        files: payloadFiles
      });
      
      const { scanId } = response.data;
      navigate(`/results/${scanId}`);
    } catch (err) {
      setError(err.message || 'Scan initiation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionContainer className="fade-in" style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 className="scan-title" style={{ fontSize: '2rem', fontWeight: 800 }}>Trigger Code Analysis</h1>
        <p className="scan-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Execute analysis pipelines for models documentation, test coverage, and vulnerabilities.
        </p>
      </header>

      {error && (
        <div className="alert alert-danger" role="alert">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Core Config Card */}
        <Card title="Repository Configuration">
          <div className="input-group">
            <label className="input-label" htmlFor="scan-repo-id">Repository / Project ID</label>
            <input
              id="scan-repo-id"
              type="text"
              className="form-control"
              placeholder="my-project-id"
              value={repoId}
              onChange={(e) => setRepoId(e.target.value)}
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" htmlFor="scan-triggered-by">Triggered By</label>
            <input
              id="scan-triggered-by"
              type="text"
              className="form-control"
              placeholder="developer@company.com"
              value={triggeredBy}
              onChange={(e) => setTriggeredBy(e.target.value)}
            />
          </div>
        </Card>

        {/* Files Configuration Card */}
        <Card 
          title="Analysis Targets" 
          headerAction={
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddFile}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              + Add File
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {files.map((file, index) => (
              <div 
                key={index} 
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '16px',
                  backgroundColor: 'rgba(10, 14, 18, 0.4)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ 
                    fontFamily: 'var(--font-heading)', 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: 'var(--primary-hover)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    File #{index + 1}
                  </span>
                  {files.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-heading)'
                      }}
                      onMouseOver={(e) => e.target.style.color = 'var(--error)'}
                      onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                    >
                      Delete Target
                    </button>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>File Path</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="src/main.py"
                    value={file.path}
                    onChange={(e) => handleFileChange(index, 'path', e.target.value)}
                    required
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>File Content</label>
                  <textarea
                    className="form-control"
                    placeholder="Paste source code content here..."
                    rows={4}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', resize: 'vertical' }}
                    value={file.content}
                    onChange={(e) => handleFileChange(index, 'content', e.target.value)}
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn-add-file"
            onClick={handleAddFile}
            style={{
              width: '100%',
              marginTop: '16px',
              border: '1px dashed var(--border)',
              backgroundColor: 'rgba(20, 22, 30, 0.4)',
              color: 'var(--primary-hover)',
              padding: '10px',
              cursor: 'pointer',
              borderRadius: '6px',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
            onMouseOver={(e) => e.target.style.borderColor = 'var(--primary)'}
            onMouseOut={(e) => e.target.style.borderColor = 'var(--border)'}
          >
            + Add Another Code Target
          </button>
        </Card>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
          disabled={submitting}
        >
          {submitting ? 'Running Analysis Agents...' : 'Initiate Security Pipeline'}
        </button>
      </form>
    </SectionContainer>
  );
};

export default Scan;
