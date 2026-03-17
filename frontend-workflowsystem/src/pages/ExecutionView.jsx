import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, Clock, CheckCircle, XCircle, Play, AlertCircle, ArrowLeft, User, MessageCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { workflowService } from '../services/api';

const ExecutionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExecution();
    const interval = setInterval(fetchExecution, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchExecution = async () => {
    try {
      const exeData = await workflowService.getExecution(id);
      setExecution(exeData);
      
      const logsData = await workflowService.getExecutionLogs(id);
      setLogs(logsData || []);

      if (exeData.workflow && !workflow) {
        setWorkflow(exeData.workflow);
      }
    } catch (err) {
      setError('Failed to load execution details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (decision) => {
    try {
      setExecuting(true);
      const currentLog = logs.find(l => l.status === 'awaiting_approval');
      if (!currentLog) return;
      
      const step = workflow?.steps.find(s => s.name === currentLog.stepName);
      const stepId = step ? step.id : currentLog.stepId;
      
      await workflowService.submitAction(id, stepId, decision);
      fetchExecution();
    } catch (err) {
      setError('Action failed: ' + err.message);
    } finally {
      setExecuting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return <CheckCircle size={20} color="#10b981" />;
      case 'failed': return <XCircle size={20} color="#ef4444" />;
      case 'awaiting_approval': return <Clock size={20} color="#f59e0b" />;
      case 'in_progress': return <Activity className="spin" size={20} color="#3b82f6" />;
      default: return <Clock size={20} color="var(--text-muted)" />;
    }
  };

  if (loading) return <div className="container outfit">Loading Thread...</div>;
  if (!execution) return <div className="container outfit">Execution not found.</div>;

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
        <button onClick={() => navigate('/audit')} className="action-btn" style={{ width: '44px', height: '44px' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="outfit" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Execution Trace
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            ID: <code style={{ color: 'var(--primary)' }}>{id}</code>
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div className={`badge badge-${execution.status?.toLowerCase()}`}>
            {execution.status}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Execution Timeline */}
          <section className="glass-card" style={{ padding: '32px' }}>
            <h3 className="outfit" style={{ fontSize: '1.4rem', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Activity size={22} color="var(--primary)" /> Step Sequence
            </h3>

            <div className="timeline">
              {logs.map((log, idx) => (
                <div key={idx} className="timeline-item" style={{ marginBottom: '32px', position: 'relative', paddingLeft: '40px' }}>
                  <div className="timeline-line"></div>
                  <div className="timeline-node" style={{ 
                    position: 'absolute', 
                    left: '0', 
                    top: '0', 
                    width: '32px', 
                    height: '32px', 
                    background: 'var(--glass-bright)', 
                    borderRadius: '50%',
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2
                  }}>
                    {getStatusIcon(log.status)}
                  </div>
                  
                  <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 className="outfit" style={{ fontWeight: 700 }}>{log.stepName}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(log.startedAt).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span className="tiny-badge">{log.stepType}</span>
                      {log.status === 'completed' && <span className="tiny-badge successful">Valid</span>}
                    </div>

                    {log.status === 'awaiting_approval' && (
                      <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                        <button onClick={() => handleAction('APPROVE')} className="glow-btn" style={{ flex: 1, height: '40px', background: 'var(--success)' }}>Approve</button>
                        <button onClick={() => handleAction('REJECT')} className="glow-btn secondary" style={{ flex: 1, height: '40px', borderColor: 'var(--danger)', color: 'var(--danger)' }}>Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {execution.status === 'IN_PROGRESS' && (
                <div className="timeline-item pending" style={{ paddingLeft: '40px', opacity: 0.5 }}>
                  <div className="timeline-node active" style={{ position: 'absolute', left: '0' }}><RefreshCw className="spin" size={20} color="var(--primary)" /></div>
                  <p className="outfit" style={{ fontSize: '0.9rem' }}>Processing next strategy node...</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section className="glass-card" style={{ padding: '24px' }}>
            <h4 className="outfit" style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Context Data</h4>
            <pre className="code-block" style={{ fontSize: '0.8rem', padding: '16px', borderRadius: '12px', overflow: 'auto' }}>
              {JSON.stringify(JSON.parse(execution.data || '{}'), null, 2)}
            </pre>
          </section>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .timeline-line {
          position: absolute;
          left: 15px;
          top: 32px;
          bottom: -32px;
          width: 2px;
          background: var(--glass-border);
          opacity: 0.3;
        }
        .timeline-item:last-child .timeline-line { display: none; }
        .tiny-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          background: var(--glass-bright);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .tiny-badge.successful {
          color: var(--success);
          border-color: rgba(16, 185, 129, 0.2);
        }
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default ExecutionView;
