import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { workflowService } from '../services/api';

const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await workflowService.getMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch metrics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card" style={{ padding: '24px', height: '100px', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="outfit" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Syncing Intelligence...</span>
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="glass-card" style={{ padding: '24px', marginBottom: '40px', borderLeft: '4px solid var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
        <p className="outfit" style={{ color: 'var(--danger)', fontWeight: 600 }}>Engine Metrics Unavailable</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Failed to establish connection with the telemetry service. Please check backend status.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
      <MetricCard 
        label="Total Executions" 
        value={metrics.total || 0} 
        icon={<Zap size={20} color="var(--primary)" />} 
        color="var(--primary)"
      />
      <MetricCard 
        label="Successful" 
        value={metrics.completed || 0} 
        icon={<CheckCircle size={20} color="var(--success)" />} 
        color="var(--success)"
      />
      <MetricCard 
        label="Ongoing" 
        value={metrics.in_progress || 0} 
        icon={<Clock size={20} color="var(--accent)" />} 
        color="var(--accent)"
      />
      <MetricCard 
        label="Failed" 
        value={metrics.failed || 0} 
        icon={<XCircle size={20} color="var(--danger)" />} 
        color="var(--danger)"
      />
    </div>
  );
};

const MetricCard = ({ label, value, icon, color }) => (
  <div className="glass-card" style={{ 
    padding: '24px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px',
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      {icon}
    </div>
    <div className="outfit" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
      {value}
    </div>
  </div>
);

export default DashboardMetrics;
