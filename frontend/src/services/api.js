import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Debug: indicate whether a token will be attached
  try {
    console.log('api.request: attaching token?', !!token, 'to', config.url);
  } catch (e) {
    /* ignore */
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn('api.response: 401 received, clearing auth and redirecting to /login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => api.post('/api/auth/register', data);
export const login = (data) => api.post('/api/auth/login', data);
export const getMe = () => api.get('/api/auth/me');

// Incidents
export const getIncidents = (params) => api.get('/api/incidents', { params });
export const getIncident = (id) => api.get(`/api/incidents/${id}`);
export const createIncident = (formData) => api.post('/api/incidents', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateIncident = (id, data) => api.put(`/api/incidents/${id}`, data);
export const deleteIncident = (id) => api.delete(`/api/incidents/${id}`);

// Notifications
export const getNotifications = () => api.get('/api/notifications');
export const markNotificationRead = (id) => api.put(`/api/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/api/notifications/read-all');

// Analytics
export const getIncidentStats = () => api.get('/api/analytics/stats');
export const getIncidentsByDate = (days = 7) => api.get('/api/analytics/by-date', { params: { days } });

// Users (authority/admin)
export const getUsers = (params) => api.get('/api/users', { params });

// Admin user management
export const adminCreateUser = (data) => api.post('/api/admin/create-user', data);
export const adminGetUsers = () => api.get('/api/admin/users');
export const adminUpdateUserRole = (id, data) => api.patch(`/api/admin/users/${id}/role`, data);
