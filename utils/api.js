import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add secret key to every request
api.interceptors.request.use(
  (config) => {
    const secretKey = localStorage.getItem('adminSecretKey');
    if (secretKey) {
      config.headers['x-admin-token'] = secretKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear invalid key and redirect to login
      localStorage.removeItem('adminSecretKey');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;