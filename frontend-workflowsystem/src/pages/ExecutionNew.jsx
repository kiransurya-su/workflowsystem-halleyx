import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, Send } from 'lucide-react';
import { workflowService } from '../services/api';

const ExecutionNew = () => {
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('workflowId');
  const navigate = useNavigate();
  
  const [workflow, setWorkflow] = useState(null);
  const [inputData, setInputData] = useState('{\n  "amount": 5000,\n  "priority": "high"\n}');
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!workflowId) {
      setError('No workflow ID provided');
      setLoading(false);
      return;
    }
    fetchWorkflow();
  }, [workflowId]);

  const fetchWorkflow = async () => {
    try {
      const data = await workflowService.get(workflowId);
      setWorkflow(data);
    } catch (err) {
      setError('Failed to load workflow details.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    try {
      setExecuting(true);
      setError(null);
      const parsedData = JSON.parse(inputData);
      const execution = await workflowService.execute(workflowId, parsedData);
      navigate(`/execution/${execution.id}`);
    } catch (err) {
      setError('Execution failed: ' + (err.name === 'SyntaxError' ? 'Invalid JSON format' : err.message));
    } finally {
      setExecuting(false);
    }
  };

  if (loading) return <div className="container outfit">Loading Workflow Config...</div>;
  if (!workflow && !error) return <div className="container outfit">Workflow not found.</div>;

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
        <button onClick={() => navigate('/')} className="action-btn" style={{ width: '44px', height: '44px' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="outfit" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Trigger Execution
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Workflow: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{workflow?.name}</span>
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ maxWidth: '800px', padding: '40px' }}>
        <div style={{ marginBottom: '24px' }}>
          <label className="outfit" style={{ display: 'block', marginBottom: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Initial JSON Context
          </label>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Provide the starting data for this execution. Steps will use this data for rule evaluation.
          </p>
          <textarea 
            className="code-block"
            style={{ 
              width: '100%', 
              height: '250px', 
              fontFamily: 'monospace', 
              fontSize: '0.9rem',
              padding: '20px',
              borderRadius: '12px'
            }}
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
          />
        </div>

        {error && (
          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <button 
          onClick={handleExecute} 
          disabled={executing || !workflow}
          className="glow-btn" 
          style={{ width: '100%', height: '56px', fontSize: '1.1rem' }}
        >
          {executing ? 'Initializing Engine...' : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <Send size={20} /> Launch Execution Thread
            </div>
          )}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
      `}} />
    </div>
  );
};

export default ExecutionNew;
