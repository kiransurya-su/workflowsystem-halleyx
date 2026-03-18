import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, Send, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { workflowService } from '../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Try to parse the workflow's inputSchema field (a JSON string or plain object)
 * and extract a list of parameter definitions.
 *
 * Supported schema shapes:
 *   1. Array of param objects  →  [{name, type, options, required}, ...]
 *   2. JSON Schema "properties" →  { type:"object", properties:{ fieldName:{type,enum,...} }, required:[] }
 *   3. Flat key-value map      →  { fieldName: "string", ... }
 */
const parseParams = (inputSchema) => {
  try {
    const raw = typeof inputSchema === 'string' ? JSON.parse(inputSchema) : inputSchema;

    // Shape 1 – already an array of param objects
    if (Array.isArray(raw)) {
      return raw.map((p) => ({
        name: p.name || p.fieldName || '',
        type: (p.type || p.dataType || 'string').toLowerCase(),
        options: Array.isArray(p.options) ? p.options : (p.options ? String(p.options).split('|').map(s => s.trim()).filter(Boolean) : []),
        required: !!p.required || !!p.mandatory,
      }));
    }

    // Shape 2 – JSON Schema with "properties"
    if (raw && raw.properties && typeof raw.properties === 'object') {
      const requiredFields = Array.isArray(raw.required) ? raw.required : [];
      return Object.entries(raw.properties).map(([fieldName, def]) => ({
        name: fieldName,
        type: (def.type || 'string').toLowerCase(),
        options: Array.isArray(def.enum) ? def.enum : [],
        required: requiredFields.includes(fieldName),
      }));
    }

    // Shape 3 – simple { fieldName: "type" } map
    if (raw && typeof raw === 'object' && Object.keys(raw).length > 0) {
      return Object.entries(raw).map(([fieldName, val]) => ({
        name: fieldName,
        type: typeof val === 'string' ? val.toLowerCase() : 'string',
        options: [],
        required: false,
      }));
    }
  } catch (_) {
    // ignore parse errors
  }
  return [];
};

const defaultValueFor = (type) => {
  if (type === 'number') return '';
  if (type === 'boolean') return false;
  return '';
};

// ─── Component ────────────────────────────────────────────────────────────────

const ExecutionNew = () => {
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('workflowId');
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState(null);
  const [params, setParams] = useState([]);          // parsed param definitions
  const [formValues, setFormValues] = useState({});  // { fieldName: value }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId]);

  const fetchWorkflow = async () => {
    try {
      const data = await workflowService.get(workflowId);
      setWorkflow(data);

      const parsed = parseParams(data.inputSchema);
      setParams(parsed);

      // Seed form values with defaults
      const defaults = {};
      parsed.forEach((p) => { defaults[p.name] = defaultValueFor(p.type); });
      setFormValues(defaults);
    } catch (err) {
      setError('Failed to load workflow details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleExecute = async () => {
    // Validate required fields
    const missing = params.filter((p) => p.required && (formValues[p.name] === '' || formValues[p.name] === null || formValues[p.name] === undefined));
    if (missing.length > 0) {
      setError(`Required fields missing: ${missing.map(p => p.name).join(', ')}`);
      return;
    }

    try {
      setExecuting(true);
      setError(null);

      // Coerce types before sending
      const payload = {};
      params.forEach((p) => {
        const raw = formValues[p.name];
        if (p.type === 'number') {
          payload[p.name] = raw === '' ? null : Number(raw);
        } else if (p.type === 'boolean') {
          payload[p.name] = !!raw;
        } else {
          payload[p.name] = raw;
        }
      });

      // If no params were defined, fall through so execution still works
      const execution = await workflowService.execute(workflowId, params.length ? payload : {});
      navigate(`/execution/${execution.id}`);
    } catch (err) {
      setError('Execution failed: ' + err.message);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) return <div className="container outfit">Loading Workflow Config...</div>;
  if (!workflow && !error) return <div className="container outfit">Workflow not found.</div>;

  return (
    <div className="container fade-in">
      {/* ── Header ── */}
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

        {/* ── Input Parameters Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
          <span className="outfit" style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Input Parameters
          </span>
        </div>

        {/* ── Form Fields ── */}
        {params.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 24px',
            border: '1px dashed var(--glass-border)',
            borderRadius: '12px',
            color: 'var(--text-muted)',
            marginBottom: '28px',
            fontSize: '0.9rem'
          }}>
            No input parameters defined for this workflow.
            <br />
            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>
              Define them in the workflow editor's Input Parameters section.
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
            {params.map((param) => (
              <div key={param.name}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  {param.name}
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    background: 'var(--glass-bright)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600
                  }}>
                    {param.type}
                  </span>
                  {param.required && (
                    <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>*</span>
                  )}
                </label>

                {/* Boolean → Toggle */}
                {param.type === 'boolean' && (
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    onClick={() => updateField(param.name, !formValues[param.name])}
                  >
                    <div style={{
                      width: '40px',
                      height: '24px',
                      background: formValues[param.name] ? 'var(--primary)' : 'var(--glass-bright)',
                      borderRadius: '20px',
                      position: 'relative',
                      border: '1px solid var(--glass-border)',
                      transition: 'var(--transition)'
                    }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        background: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: formValues[param.name] ? '18px' : '2px',
                        transition: 'var(--transition)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: formValues[param.name] ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {formValues[param.name] ? 'true' : 'false'}
                    </span>
                  </div>
                )}

                {/* Enum / Options → Dropdown */}
                {param.type !== 'boolean' && param.options.length > 0 && (
                  <select
                    value={formValues[param.name]}
                    onChange={(e) => updateField(param.name, e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--surface-hover)',
                      border: '1px solid var(--glass-border)',
                      color: formValues[param.name] ? 'var(--text-primary)' : 'var(--text-muted)',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="">— select an option —</option>
                    {param.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {/* Number → Number input */}
                {param.type === 'number' && param.options.length === 0 && (
                  <input
                    type="number"
                    placeholder={`Enter ${param.name}…`}
                    value={formValues[param.name]}
                    onChange={(e) => updateField(param.name, e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '0.9rem' }}
                  />
                )}

                {/* String / default → Text input */}
                {param.type !== 'boolean' && param.type !== 'number' && param.options.length === 0 && (
                  <input
                    type="text"
                    placeholder={`Enter ${param.name}…`}
                    value={formValues[param.name]}
                    onChange={(e) => updateField(param.name, e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', fontSize: '0.9rem' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
            padding: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger)',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '0.9rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            {error}
          </div>
        )}

        {/* ── Launch Button ── */}
        <button
          onClick={handleExecute}
          disabled={executing || !workflow}
          className="glow-btn"
          style={{ width: '100%', height: '56px', fontSize: '1.1rem' }}
        >
          {executing ? 'Initializing Engine…' : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <Send size={20} /> Launch Execution Thread
            </div>
          )}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        input[type="text"]:focus,
        input[type="number"]:focus,
        select:focus {
          outline: none;
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
      `}} />
    </div>
  );
};

export default ExecutionNew;
