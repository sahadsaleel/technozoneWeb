import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log(`🚀 Request: ${config.method.toUpperCase()} ${config.url}`, config.data || '');
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error('❌ API Error:', {
      url: err.config?.url,
      method: err.config?.method,
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login    = (d) => api.post('/auth/login', d);
export const register = (d) => api.post('/auth/register', d);
export const logout   = () => api.post('/auth/logout');
export const getMe    = () => api.get('/auth/me');
export const forgotPassword = (d) => api.post('/auth/forgot-password', d);
export const resetPassword  = (d) => api.post('/auth/reset-password', d);

// Sales
export const getSales   = (p) => api.get('/sales', { params: p });
export const createSale = (d) => api.post('/sales', d);
export const updateSale = (id,d) => api.put(`/sales/${id}`, d);
export const deleteSale = (id) => api.delete(`/sales/${id}`);

// Purchases
export const getPurchases    = (p) => api.get('/purchases', { params: p });
export const createPurchase  = (d) => api.post('/purchases', d);
export const updatePurchase  = (id,d) => api.put(`/purchases/${id}`, d);
export const deletePurchase  = (id) => api.delete(`/purchases/${id}`);

// Expenses
export const getExpenses   = (p) => api.get('/expenses', { params: p });
export const createExpense = (d) => api.post('/expenses', d);
export const updateExpense = (id,d) => api.put(`/expenses/${id}`, d);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// Products
export const getProducts    = (p) => api.get('/products', { params: p });
export const createProduct  = (d) => api.post('/products', d);
export const updateProduct  = (id,d) => api.put(`/products/${id}`, d);
export const deleteProduct  = (id) => api.delete(`/products/${id}`);

// Dashboard / Reports
export const getDashboard = (p) => api.get('/reports/dashboard', { params: p });
export const getReports   = (p) => api.get('/reports', { params: p });
export const getLedger    = (p) => api.get('/ledger', { params: p });

export default api;
