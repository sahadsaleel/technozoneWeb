import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log(`🚀 Request: ${config.method.toUpperCase()} ${config.url}`, config.data || '');
  return config;
});

// track if we are already refreshing to avoid infinite loop
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const originalRequest = err.config;

    // if 401 and not already retrying and not the refresh/login route itself
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(e => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh_token = localStorage.getItem('refresh_token');

      if (!refresh_token) {
        // no refresh token — force logout
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          { refresh_token }
        );

        const new_token = res.data.access_token;
        localStorage.setItem('token', new_token);
        api.defaults.headers.common.Authorization = `Bearer ${new_token}`;
        processQueue(null, new_token);

        originalRequest.headers.Authorization = `Bearer ${new_token}`;
        return api(originalRequest); // retry original request with new token

      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    console.error('❌ API Error:', {
      url: err.config?.url,
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });

    return Promise.reject(err);
  }
);

// Auth
export const login = (d) => api.post('/auth/login', d);
export const register = (d) => api.post('/auth/register', d);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const forgotPassword = (d) => api.post('/auth/forgot-password', d);
export const resetPassword = (d) => api.post('/auth/reset-password', d);

// Sales
export const getSales = (p) => api.get('/sales', { params: p });
export const createSale = (d) => api.post('/sales', d);
export const updateSale = (id, d) => api.put(`/sales/${id}`, d);
export const deleteSale = (id) => api.delete(`/sales/${id}`);

// Purchases
export const getPurchases = (p) => api.get('/purchases', { params: p });
export const createPurchase = (d) => api.post('/purchases', d);
export const updatePurchase = (id, d) => api.put(`/purchases/${id}`, d);
export const deletePurchase = (id) => api.delete(`/purchases/${id}`);

// Expenses
export const getExpenses = (p) => api.get('/expenses', { params: p });
export const createExpense = (d) => api.post('/expenses', d);
export const updateExpense = (id, d) => api.put(`/expenses/${id}`, d);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// Products
export const getProducts = (p) => api.get('/products', { params: p });
export const createProduct = (d) => api.post('/products', d);
export const updateProduct = (id, d) => api.put(`/products/${id}`, d);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Dashboard / Reports
export const getDashboard = (p) => api.get('/reports/dashboard', { params: p });
export const getReports = (p) => api.get('/reports', { params: p });
export const getLedger = (p) => api.get('/ledger', { params: p });

export default api;