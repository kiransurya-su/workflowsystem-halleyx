import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Play, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { workflowService } from '../services/api';
import DashboardMetrics from '../components/DashboardMetrics';

const WorkflowList = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkflows();
  }, [page, search]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowService.list(page, 10, search);
      setWorkflows(data.content);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to load workflows. Please check if the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await workflowService.delete(id);
        fetchWorkflows();
      } catch (err) {
        alert('Failed to delete workflow');
      }
    }
  };

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 className="outfit" style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '8px' }}>
            Workflows
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Design, automate, and monitor your business logic in one place.
          </p>
        </div>
        <Link to="/editor/new" className="glow-btn">
          <Plus size={20} /> Create New Workflow
        </Link>
      </div>

      <DashboardMetrics />

      <div className="glass-card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="Search workflows by name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '48px' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
            <p className="outfit" style={{ color: 'var(--text-secondary)' }}>Syncing with repository...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</div>
            <button className="glow-btn secondary" onClick={fetchWorkflows}>Try Again</button>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--glass-bright)', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>ID</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Workflow Name</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Steps</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Version</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map((wf) => (
                    <tr key={wf.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--glass-border)', transition: 'var(--transition)' }}>
                      <td style={{ padding: '20px' }}>
                        <code style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{wf.id.substring(0, 8)}</code>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{wf.name}</div>
                      </td>
                      <td style={{ padding: '20px', color: 'var(--text-secondary)' }}>
                        {wf.steps?.length || 0}
                      </td>
                      <td style={{ padding: '20px' }}>
                        <span style={{ 
                          background: 'rgba(99, 102, 241, 0.1)', 
                          color: 'var(--primary)',
                          padding: '4px 10px', 
                          borderRadius: '6px', 
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}>
                          v{wf.version}
                        </span>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <span className={`badge ${wf.isActive ? 'badge-active' : 'badge-pending'}`}>
                          {wf.isActive ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                          <Link to={`/editor/${wf.id}`} className="action-btn" title="Edit Master"><Edit2 size={16} /></Link>
                          <Link to={`/execution/new?workflowId=${wf.id}`} className="action-btn play" title="Trigger Run"><Play size={16} /></Link>
                          <button onClick={() => handleDelete(wf.id)} className="action-btn delete" title="Archive"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {workflows.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                        <Search size={48} style={{ opacity: 0.1, marginBottom: '20px' }} />
                        <h3 className="outfit">No workflows found</h3>
                        <p>Try a different search term or create a new one.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', borderTop: '1px solid var(--glass-border)' }}>
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))} 
                disabled={page === 0}
                className="action-btn"
                style={{ width: '40px', height: '40px' }}
              >
                <ChevronLeft size={20} />
              </button>
              <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                Page <span style={{ color: 'var(--text-primary)' }}>{page + 1}</span> of {totalPages}
              </div>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
                className="action-btn"
                style={{ width: '40px', height: '40px' }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
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
          display: flex;
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
        .action-btn.play:hover {
          background: rgba(16, 185, 129, 0.2);
          color: var(--accent);
          border-color: var(--accent);
          box-shadow: 0 0 15px var(--accent-glow);
        }
        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.2);
          color: var(--danger);
          border-color: var(--danger);
        }
        .spinner {
          width: 40px;
          height: 40px;
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

export default WorkflowList;
