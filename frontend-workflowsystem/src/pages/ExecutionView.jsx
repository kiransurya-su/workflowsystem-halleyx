import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, Clock, CheckCircle, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { workflowService } from '../services/api';
import './ExecutionView.css';

/**
 * Sub-component for rendering status icons based on step state.
 */
const StatusIcon = ({ status }) => {
  switch(status?.toLowerCase()) {
    case 'completed': return <CheckCircle size={20} color="#10b981" />;
    case 'failed': return <XCircle size={20} color="#ef4444" />;
    case 'awaiting_approval': return <Clock size={20} color="#f59e0b" />;
    case 'in_progress': return <Activity className="spin-slow" size={20} color="#3b82f6" />;
    default: return <Clock size={20} color="var(--text-muted)" />;
  }
};

/**
 * Main View for tracking and interacting with a specific workflow execution.
 * Provides a real-time timeline of steps and data context.
 */
const ExecutionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  const fetchExecution = useCallback(async () => {
    try {
      const exeData = await workflowService.getExecution(id);
      setExecution(exeData);
      
      const logsData = await workflowService.getExecutionLogs(id);
      setLogs(logsData || []);
    } catch (err) {
      console.error('Failed to load execution details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExecution();
    const interval = setInterval(fetchExecution, 5000);
    return () => clearInterval(interval);
  }, [fetchExecution]);

  const handleAction = async (decision) => {
    try {
      setExecuting(true);
      const currentLog = logs.find(l => l.status === 'awaiting_approval');
      if (!currentLog) return;
      
      await workflowService.submitAction(id, currentLog.stepId, decision);
      fetchExecution();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) return <div className="execution-container outfit">Loading Thread context...</div>;
  if (!execution) return <div className="execution-container outfit">Execution record not found.</div>;

  return (
    <div className="execution-container">
      <header className="execution-header">
        <button onClick={() => navigate('/audit')} className="back-button" aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="execution-title">Execution Trace</h1>
          <p className="execution-id">
            Thread ID: <code>{id}</code>
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div className={`badge badge-${execution.status?.toLowerCase()}`}>
            {execution.status}
          </div>
        </div>
      </header>

      <div className="execution-layout">
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section className="timeline-section">
            <h3 className="timeline-title">
              <Activity size={22} color="var(--primary)" /> Step Sequence
            </h3>

            <div className="timeline-list">
              {logs.map((log, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-node">
                    <StatusIcon status={log.status} />
                  </div>
                  
                  <div className="step-card">
                    <div className="step-header">
                      <h4 className="step-name">{log.stepName}</h4>
                      <span className="step-time">{new Date(log.startedAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="step-badges">
                      <span className="type-badge">{log.stepType}</span>
                      {log.status === 'completed' && <span className="type-badge status-valid">Valid</span>}
                    </div>

                    {log.status === 'awaiting_approval' && (
                      <div className="approval-actions">
                        <button 
                          disabled={executing}
                          onClick={() => handleAction('APPROVE')} 
                          className="glow-btn" 
                          style={{ flex: 1, padding: '0.75rem', background: 'var(--success)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button 
                          disabled={executing}
                          onClick={() => handleAction('REJECT')} 
                          className="glow-btn secondary" 
                          style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {execution.status === 'IN_PROGRESS' && (
                <div className="timeline-item" style={{ opacity: 0.6 }}>
                  <div className="timeline-node">
                    <RefreshCw className="spin-slow" size={18} color="var(--primary)" />
                  </div>
                  <p className="outfit" style={{ fontSize: '0.9rem', padding: '0.5rem 0 0 1rem' }}>
                    Engine processing next logic node...
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section className="context-section">
            <h4 className="outfit" style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Runtime Context</h4>
            <pre className="data-preview">
              {JSON.stringify(JSON.parse(execution.data || '{}'), null, 2)}
            </pre>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default ExecutionView;
