import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, Settings, List, Codesandbox, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { workflowService } from '../services/api';

const WorkflowEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [workflow, setWorkflow] = useState({
    name: '',
    isActive: true,
    maxIterations: 100,
    inputSchema: '{}',
    steps: []
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isNew) {
      fetchWorkflow();
    }
  }, [id]);

  const fetchWorkflow = async () => {
    try {
      const data = await workflowService.get(id);
      setWorkflow(data);
    } catch (err) {
      setError('Failed to load workflow.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (isNew) {
        await workflowService.create(workflow);
      } else {
        await workflowService.update(id, workflow);
      }
      navigate('/');
    } catch (err) {
      setError('Failed to save workflow.');
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => {
    const newStep = {
      name: 'New Step',
      stepType: 'TASK',
      order: workflow.steps.length + 1,
      metadata: '{}',
      rules: []
    };
    setWorkflow({ ...workflow, steps: [...workflow.steps, newStep] });
  };

  if (loading) return <div className="container outfit">Loading Editor...</div>;

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
        <button onClick={() => navigate('/')} className="action-btn" style={{ width: '44px', height: '44px' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="outfit" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {isNew ? 'Create New Strategy' : 'Edit Workflow Strategy'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Configure steps, rules, and input schema for your automation.
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <button onClick={handleSave} className="glow-btn" disabled={saving}>
            <Save size={20} /> {saving ? 'Finalizing...' : 'Save Workflow'}
          </button>
        </div>
      </div>

      <div className="editor-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '32px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Core Settings */}
          <section className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <Settings size={22} color="var(--primary)" />
              <h3 className="outfit" style={{ fontSize: '1.4rem' }}>Configuration</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="form-row">
                <label className="label">Workflow Name</label>
                <input 
                  type="text" 
                  value={workflow.name} 
                  onChange={(e) => setWorkflow({...workflow, name: e.target.value})} 
                  placeholder="e.g. High Priority Approval"
                />
              </div>
              <div className="form-row">
                <label className="label">Iteration Limit</label>
                <input 
                  type="number" 
                  value={workflow.maxIterations} 
                  onChange={(e) => setWorkflow({...workflow, maxIterations: parseInt(e.target.value)})} 
                />
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                onClick={() => setWorkflow({...workflow, isActive: !workflow.isActive})}
                style={{ 
                  width: '40px', 
                  height: '24px', 
                  background: workflow.isActive ? 'var(--primary)' : 'var(--glass-bright)', 
                  borderRadius: '20px',
                  position: 'relative',
                  cursor: 'pointer',
                  border: '1px solid var(--glass-border)',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ 
                  width: '18px', 
                  height: '18px', 
                  background: 'white', 
                  borderRadius: '50%', 
                  position: 'absolute', 
                  top: '2px', 
                  left: workflow.isActive ? '18px' : '2px',
                  transition: 'var(--transition)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </div>
              <span className="outfit" style={{ fontSize: '0.9rem', color: workflow.isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {workflow.isActive ? 'Active Strategy' : 'Draft Mode'}
              </span>
            </div>
          </section>

          {/* Workflow Steps */}
          <section className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <List size={22} color="var(--secondary)" />
                <h3 className="outfit" style={{ fontSize: '1.4rem' }}>Execution Steps</h3>
              </div>
              <button onClick={addStep} className="glow-btn secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <Plus size={16} /> Add New Step
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {workflow.steps.map((step, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '24px', background: 'var(--glass-bright)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ 
                      background: 'var(--primary)', 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '10px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyChild: 'center',
                      fontSize: '0.9rem', 
                      fontWeight: 800,
                      boxShadow: '0 0 15px var(--primary-glow)',
                      justifyContent: 'center'
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <input 
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          padding: '0', 
                          fontSize: '1.2rem', 
                          fontWeight: 700, 
                          width: '100%',
                          borderBottom: '1px solid transparent'
                        }}
                        onFocus={(e) => e.target.style.borderBottomColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
                        value={step.name}
                        onChange={(e) => {
                          const newSteps = [...workflow.steps];
                          newSteps[idx].name = e.target.value;
                          setWorkflow({...workflow, steps: newSteps});
                        }}
                      />
                    </div>
                    <select 
                      value={step.stepType}
                      onChange={(e) => {
                        const newSteps = [...workflow.steps];
                        newSteps[idx].stepType = e.target.value;
                        setWorkflow({...workflow, steps: newSteps});
                      }}
                      style={{ 
                        background: 'var(--surface-hover)', 
                        border: '1px solid var(--glass-border)',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      <option value="TASK">⚡ TASK</option>
                      <option value="APPROVAL">🛡️ APPROVAL</option>
                      <option value="NOTIFICATION">🔔 NOTIFY</option>
                    </select>
                    <button className="action-btn delete" onClick={() => {
                      const newSteps = workflow.steps.filter((_, i) => i !== idx);
                      setWorkflow({...workflow, steps: newSteps});
                    }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  {/* Rules Component */}
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 className="outfit" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>DECISION RULES</h4>
                      <button onClick={() => {
                        const newSteps = [...workflow.steps];
                        const newRules = [...(newSteps[idx].rules || [])];
                        newRules.push({ condition: 'true', priority: newRules.length + 1 });
                        newSteps[idx].rules = newRules;
                        setWorkflow({...workflow, steps: newSteps});
                      }} className="action-btn" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                        + Add Exception
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(step.rules || []).sort((a,b) => a.priority - b.priority).map((rule, rIdx) => (
                        <div key={rIdx} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button 
                              onClick={() => {
                                if (rIdx === 0) return;
                                const newSteps = [...workflow.steps];
                                const currentRules = [...newSteps[idx].rules].sort((a,b) => a.priority - b.priority);
                                // Swap priorities
                                const temp = currentRules[rIdx].priority;
                                currentRules[rIdx].priority = currentRules[rIdx-1].priority;
                                currentRules[rIdx-1].priority = temp;
                                newSteps[idx].rules = currentRules;
                                setWorkflow({...workflow, steps: newSteps});
                              }}
                              className="action-btn" style={{ padding: '2px' }} title="Increase Priority"
                            >
                              <ChevronUp size={12} />
                            </button>
                            <button 
                              onClick={() => {
                                const currentRules = [...workflow.steps[idx].rules].sort((a,b) => a.priority - b.priority);
                                if (rIdx === currentRules.length - 1) return;
                                const newSteps = [...workflow.steps];
                                // Swap priorities
                                const temp = currentRules[rIdx].priority;
                                currentRules[rIdx].priority = currentRules[rIdx+1].priority;
                                currentRules[rIdx+1].priority = temp;
                                newSteps[idx].rules = currentRules;
                                setWorkflow({...workflow, steps: newSteps});
                              }}
                              className="action-btn" style={{ padding: '2px' }} title="Decrease Priority"
                            >
                              <ChevronDown size={12} />
                            </button>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, minWidth: '30px' }}>P{rule.priority}</div>
                          <input 
                            style={{ flex: 3, padding: '8px 12px', fontSize: '0.85rem' }}
                            placeholder="Condition (e.g. amount > 500)"
                            value={rule.condition}
                            onChange={(e) => {
                              const newSteps = [...workflow.steps];
                              const foundRule = newSteps[idx].rules.find(r => r.priority === rule.priority);
                              if (foundRule) foundRule.condition = e.target.value;
                              setWorkflow({...workflow, steps: newSteps});
                            }}
                          />
                          <input 
                            style={{ flex: 1.5, padding: '8px 12px', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}
                            placeholder="Next Step ID"
                            value={rule.nextStepReference || ''}
                            onChange={(e) => {
                              const newSteps = [...workflow.steps];
                              const foundRule = newSteps[idx].rules.find(r => r.priority === rule.priority);
                              if (foundRule) foundRule.nextStepReference = e.target.value;
                              setWorkflow({...workflow, steps: newSteps});
                            }}
                          />
                          <button onClick={() => {
                             const newSteps = [...workflow.steps];
                             newSteps[idx].rules = newSteps[idx].rules.filter(r => r.priority !== rule.priority);
                             // Re-normalize priorities
                             newSteps[idx].rules.sort((a,b) => a.priority - b.priority).forEach((r, i) => r.priority = i + 1);
                             setWorkflow({...workflow, steps: newSteps});
                          }} className="action-btn delete" style={{ padding: '6px' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {workflow.steps.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', border: '1px dashed var(--glass-border)', borderRadius: '16px', color: 'var(--text-muted)' }}>
                  <List size={40} style={{ opacity: 0.1, marginBottom: '16px' }} />
                  <p>Your workflow currently has no steps.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar: Schema */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', minWidth: 0 }}>
          <section className="glass-card" style={{ padding: '32px', width: '100%', maxWidth: '380px', justifySelf: 'end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Codesandbox size={22} color="var(--accent)" />
              <h3 className="outfit" style={{ fontSize: '1.4rem' }}>Validation</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.6' }}>
              Define the incoming JSON schema to validate data before execution starts.
            </p>
            <textarea 
              className="code-block"
              value={workflow.inputSchema}
              onChange={(e) => setWorkflow({...workflow, inputSchema: e.target.value})}
              style={{ width: '100%', height: '400px', fontSize: '0.85rem', padding: '20px', borderRadius: '12px' }}
              placeholder='{ "type": "object", ... }'
            />
            {error && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                color: 'var(--danger)', 
                borderRadius: '8px',
                fontSize: '0.85rem',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                display: 'flex',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </section>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .form-row { display: flex; flex-direction: column; gap: 8px; }
        .label { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .action-btn {
          background: var(--glass-bright);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          padding: 10px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .action-btn:hover {
          background: var(--surface-hover);
          color: var(--text-primary);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.2);
          color: var(--danger);
          border-color: var(--danger);
        }
      `}} />
    </div>
  );
};

export default WorkflowEditor;
