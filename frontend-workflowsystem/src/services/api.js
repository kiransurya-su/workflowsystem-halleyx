const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API Request Failed' }));
    throw new Error(error.message || 'API Request Failed');
  }
  if (response.status === 204) return null;
  return response.json();
};

export const workflowService = {
  // Workflows
  list: (page = 0, size = 10, search = '') => 
    fetch(`${API_BASE}/workflows?page=${page}&size=${size}&search=${search}`).then(handleResponse),
  
  get: (id) => 
    fetch(`${API_BASE}/workflows/${id}`).then(handleResponse),
  
  create: (workflow) => 
    fetch(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow)
    }).then(handleResponse),
  
  update: (id, workflow) => 
    fetch(`${API_BASE}/workflows/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow)
    }).then(handleResponse),
  
  delete: (id) => 
    fetch(`${API_BASE}/workflows/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Steps
  getSteps: (workflowId) => 
    fetch(`${API_BASE}/workflows/${workflowId}/steps`).then(handleResponse),
  
  addStep: (workflowId, step) => 
    fetch(`${API_BASE}/workflows/${workflowId}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(step)
    }).then(handleResponse),

  // Rules
  addRule: (stepId, rule) => 
    fetch(`${API_BASE}/steps/${stepId}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    }).then(handleResponse),

  // Executions
  execute: (workflowId, data) => 
    fetch(`${API_BASE}/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse),
  
  getExecution: (id) => 
    fetch(`${API_BASE}/executions/${id}`).then(handleResponse),
  
  getExecutionLogs: (id) => 
    fetch(`${API_BASE}/executions/${id}/logs`).then(handleResponse),
  
  getExecutions: (page = 0, size = 10) => 
    fetch(`${API_BASE}/executions?page=${page}&size=${size}`).then(handleResponse),
  
  submitAction: (executionId, stepId, decision) => 
    fetch(`${API_BASE}/executions/${executionId}/action?stepId=${stepId}&decision=${decision}`, {
      method: 'POST'
    }).then(handleResponse),
  
  cancelExecution: (id) => 
    fetch(`${API_BASE}/executions/${id}/cancel`, { method: 'POST' }).then(handleResponse),
  
  retryExecution: (id) => 
    fetch(`${API_BASE}/executions/${id}/retry`, { method: 'POST' }).then(handleResponse),
  
  getMetrics: () => 
    fetch(`${API_BASE}/metrics`).then(handleResponse)
};
