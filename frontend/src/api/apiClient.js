import axios from 'axios';

// Axios instance — baseURL from env, cookies sent for refresh token
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Required: backend stores refresh token in HttpOnly cookie
});

// ─── Request Interceptor ────────────────────────────────────────────────────
// Attach access token (stored in memory via AuthContext) to every request.
// The token getter is injected at runtime to avoid circular imports.
let getAccessToken = null;
let onAuthFailure = null;

export function setAuthHandlers({ tokenGetter, authFailureHandler }) {
  getAccessToken = tokenGetter;
  onAuthFailure = authFailureHandler;
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken ? getAccessToken() : null;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor ───────────────────────────────────────────────────
// On 401: attempt a single silent refresh, then retry the original request.
// Guard against infinite loops by flagging retried requests.
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle special error codes from the backend
    const errorCode = error.response?.data?.code;

    if (errorCode === 'PASSWORD_RECENTLY_CHANGED' || errorCode === 'ACCOUNT_SUSPENDED') {
      if (onAuthFailure) onAuthFailure(errorCode);
      return Promise.reject(error);
    }

    // Only attempt refresh on 401, and never for the refresh endpoint itself
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');
    const isLoginEndpoint = originalRequest.url?.includes('/auth/login');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshEndpoint &&
      !isLoginEndpoint
    ) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt silent refresh — uses HttpOnly cookie automatically
        const refreshResponse = await apiClient.post('/auth/refresh');
        const newToken = refreshResponse.data?.accessToken;

        if (newToken && getAccessToken) {
          // Notify AuthContext of the new token via the failure handler pattern
          // (AuthContext sets a setter via setAuthHandlers)
          if (onAuthFailure) {
            // We signal a token update; AuthContext handles this separately
          }
          processQueue(null, newToken);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          // Update the in-memory token through a setter registered by AuthContext
          if (window.__setAccessToken) window.__setAccessToken(newToken);

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (onAuthFailure) onAuthFailure('SESSION_EXPIRED');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
