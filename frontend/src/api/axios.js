import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Auto-send secure httpOnly cookies cross-origin
  headers: {
    'Content-Type': 'application/json'
  }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach bearer token to authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('meridian_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors like 401 and 429 with token refresh retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;

    // Handle token expiration retries
    if (status === 401 && !originalRequest._retry) {
      // Check if this endpoint is already auth or refresh to prevent loop crashes
      const isAuthEndpoint = 
        originalRequest.url.includes('/auth/refresh') || 
        originalRequest.url.includes('/auth/login') ||
        originalRequest.url.includes('/auth/register');

      if (isAuthEndpoint) {
        localStorage.removeItem('meridian_token');
        localStorage.removeItem('meridian_user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(error);
      }

      // Enforce 1-retry boundary
      originalRequest._retry = true;

      // Queue concurrent requests while token refresh is in progress
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        // Refresh access token via Axios standalone call to bypass interceptor overrides
        const res = await axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        );
        const { token: newAccessToken } = res.data;

        localStorage.setItem('meridian_token', newAccessToken);

        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Re-run original failed request with the new access token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clean local session variables and redirect to login
        localStorage.removeItem('meridian_token');
        localStorage.removeItem('meridian_user');
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(refreshError);
      }
    }

    if (status === 429) {
      const customError = new Error('Too many requests, please try again later');
      customError.status = 429;
      return Promise.reject(customError);
    }

    const backendMessage = error.response?.data?.error;
    if (backendMessage) {
      const customError = new Error(backendMessage);
      customError.status = status;
      return Promise.reject(customError);
    }

    return Promise.reject(error);
  }
);

export default api;
