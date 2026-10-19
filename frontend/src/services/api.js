const API_BASE_URL = typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null'
  ? `${window.location.origin}/api`
  : '/api';

/**
 * Universal API helper for sending authenticated JSON requests.
 */
export async function apiRequest(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const token = localStorage.getItem('token');

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.error?.message || `HTTP ${response.status}: Request failed`);
    error.status = response.status;
    error.code = data?.error?.code || 'API_ERROR';
    error.details = data?.error?.details;
    throw error;
  }

  return data;
}

export const api = {
  get: (url, headers) => apiRequest(url, { method: 'GET', headers }),
  post: (url, body, headers) => apiRequest(url, { method: 'POST', body, headers }),
  patch: (url, body, headers) => apiRequest(url, { method: 'PATCH', body, headers }),
  delete: (url, headers) => apiRequest(url, { method: 'DELETE', headers }),
};

export default api;
