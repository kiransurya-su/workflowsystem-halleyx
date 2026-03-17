import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye, CheckCircle, XCircle, Clock, User, ArrowRight, Activity } from 'lucide-react';
import { workflowService } from '../services/api';

const AuditLog = () => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchExecutions();
  }, [page]);

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getExecutions(page, 10);
      setExecutions(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Failed to load audit logs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return '#10b981';
      case 'failed': return '#ef4444';
      case 'in_progress': return '#3b82f6';
      case 'canceled': return '#94a3b8';
      default: return 'var(--text-secondary)';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="container fade-in">
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="outfit" style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '8px' }}>
            System Audit
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Comprehensive traceability for every automated execution strategy.
          </p>
        </div>
        <button className="glow-btn secondary" onClick={fetchExecutions} style={{ padding: '10px 20px' }}>
          <Activity size={18} /> Refresh Logs
        </button>
      </div>

      <div className="glass-card" style={{ padding: '0px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
            <p className="outfit" style={{ color: 'var(--text-secondary)' }}>Retrieving secure records...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <XCircle size={48} color="var(--danger)" style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h3 className="outfit" style={{ marginBottom: '16px' }}>{error}</h3>
            <button className="glow-btn secondary" onClick={fetchExecutions}>Reconnect to API</button>
          </div>
        ) : executions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <FileText size={64} color="var(--glass-border)" style={{ marginBottom: '24px', opacity: 0.2 }} />
            <h2 className="outfit">Clear Horizon</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '12px auto 32px' }}>
              No execution data has been recorded yet. Launch a workflow task to populate this registry.
            </p>
            <Link to="/" className="glow-btn">Start First Execution</Link>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--glass-bright)', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Execution ID</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Workflow</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Version</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Started By</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Start Time</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>End Time</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map((exe) => (
                    <tr key={exe.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--glass-border)', transition: 'var(--transition)' }}>
                      <td style={{ padding: '20px' }}>
                        <code style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                          {exe.id.substring(0, 8).toUpperCase()}
                        </code>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <span style={{ fontWeight: 600 }}>{exe.workflow?.name || 'In-memory Task'}</span>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--glass-bright)', padding: '2px 6px', borderRadius: '4px' }}>v{exe.workflowVersion}</span>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          color: getStatusColor(exe.status), 
                          fontWeight: 700, 
                          fontSize: '0.7rem',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: `rgba(255,255,255,0.03)`,
                          border: `1px solid ${getStatusColor(exe.status)}33`
                        }}>
                          {exe.status?.toUpperCase() || 'UNKNOWN'}
                        </div>
                      </td>
                      <td style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {exe.triggeredBy ? exe.triggeredBy.substring(0, 8) : 'system'}
                      </td>
                      <td style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {formatDate(exe.startedAt)}
                      </td>
                      <td style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {formatDate(exe.endedAt)}
                      </td>
                      <td style={{ padding: '20px', textAlign: 'right' }}>
                        <Link to={`/execution/${exe.id}`} className="action-btn" title="View Logs">
                          <Eye size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', borderTop: '1px solid var(--glass-border)' }}>
                <button 
                  onClick={() => setPage(p => Math.max(0, p - 1))} 
                  disabled={page === 0}
                  className="action-btn"
                  style={{ width: '40px', height: '40px' }}
                >
                  <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} />
                </button>
                <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Record <span style={{ color: 'var(--text-primary)' }}>{page + 1}</span> of {totalPages}
                </div>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                  className="action-btn"
                  style={{ width: '40px', height: '40px' }}
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .table-row-hover:hover { background: var(--glass-bright); }
        .action-btn {
          background: var(--glass-bright);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          padding: 10px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }
        .action-btn:hover {
          background: var(--surface-hover);
          color: var(--text-primary);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        .spinner {
          width: 44px;
          height: 44px;
          border: 3px solid var(--glass-border);
          border-radius: 50%;
          border-top-color: var(--primary);
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default AuditLog;
