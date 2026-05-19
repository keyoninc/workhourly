const API_BASE_URL = 'http://localhost:4000';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (typeof window !== 'undefined') {
    const tenant = localStorage.getItem('tenant');
    if (tenant) {
      try {
        const parsed = JSON.parse(tenant);
        if (parsed.id) headers['x-tenant-id'] = parsed.id;
      } catch (e) {}
    }
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Something went wrong');
  }

  return res.json();
}
