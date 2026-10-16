const TOKEN_KEY = 'spark_admin_token';

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

const API_BASE = (import.meta.env.VITE_API_BASE || '').trim().replace(/\/api\/?$/, '').replace(/\/$/, '');

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/uploads')) {
    const base = API_BASE || '';
    return `${base}${url}`;
  }
  return url;
}

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const targetUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;

  const response = await fetch(targetUrl, {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearToken();
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Public API
export async function fetchPublishedPosts() {
  return request('/api/posts');
}

export async function fetchPostById(id) {
  return request(`/api/posts/${id}`);
}

export async function loginAdmin(password) {
  const data = await request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ password })
  });
  if (data.token) {
    setToken(data.token);
  }
  return data;
}

export async function logoutAdmin() {
  try {
    await request('/api/logout', { method: 'POST' });
  } finally {
    clearToken();
  }
}

// Admin API
export async function fetchAdminPosts() {
  return request('/api/admin/posts');
}

export async function createPost(postData) {
  return request('/api/admin/posts', {
    method: 'POST',
    body: JSON.stringify(postData)
  });
}

export async function updatePost(id, postData) {
  return request(`/api/admin/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(postData)
  });
}

export async function deletePost(id) {
  return request(`/api/admin/posts/${id}`, {
    method: 'DELETE'
  });
}

// Gallery API
export async function fetchGallery() {
  return request('/api/gallery');
}

export async function createGalleryImage(imageData) {
  return request('/api/admin/gallery', {
    method: 'POST',
    body: JSON.stringify(imageData)
  });
}

export async function uploadGalleryImage(file) {
  const token = getToken();
  const imageData = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
  return request('/api/admin/gallery/upload', {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ name: file.name, type: file.type, data: imageData })
  });
}

export async function updateGalleryImage(id, imageData) {
  return request(`/api/admin/gallery/${id}`, {
    method: 'PUT',
    body: JSON.stringify(imageData)
  });
}

export async function deleteGalleryImage(id) {
  return request(`/api/admin/gallery/${id}`, {
    method: 'DELETE'
  });
}

