const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

/**
 * Centrally handles API responses and converts errors into human-readable messages.
 * Enhanced to extract backend error codes for specific UI feedback.
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = 'An unexpected connection error occurred';
    let errorCode = 'NETWORK_ERROR';

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      errorCode = errorData.errorCode || errorCode;
    } catch (e) {
      // Fallback for non-JSON error responses
    }
    
    const error = new Error(errorMessage);
    error.code = errorCode;
    error.status = response.status;
    throw error;
  }
  
  if (response.status === 204) return null;
  return response.json();
};

export const workflowService = {
  // --- Workflow Management ---
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

  // --- Step Configuration ---
  getSteps: (workflowId) => 
    fetch(`${API_BASE}/workflows/${workflowId}/steps`).then(handleResponse),
  
  addStep: (workflowId, step) => 
    fetch(`${API_BASE}/workflows/${workflowId}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(step)
    }).then(handleResponse),

  // --- Rule Definition ---
  addRule: (stepId, rule) => 
    fetch(`${API_BASE}/steps/${stepId}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    }).then(handleResponse),

  // --- Execution & Runtime ---
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
