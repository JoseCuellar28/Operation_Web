import axios from 'axios';

// Extend Axios Request Config to include _retryCount
declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        _retryCount?: number;
    }
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://locale-beijing-simultaneously-wilson.trycloudflare.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        // Debug Log
        // console.log(`[API] Request to ${config.url} | Token exists: ${!!token}`);

        if (token && token !== 'undefined' && token !== 'null') {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Circuit Breaker State
let failureCount = 0;
let isCircuitOpen = false;
const FAILURE_THRESHOLD = 5;
const CIRCUIT_RESET_TIME = 10000; // 10 seconds

// Response Interceptor: Handle 401 and Retry Logic
api.interceptors.response.use(
    (response) => {
        // Successful response - reset circuit breaker
        failureCount = 0;
        isCircuitOpen = false;
        return response;
    },
    async (error) => {
        // Fast fail if circuit is open
        if (isCircuitOpen) {
            return Promise.reject(new Error('Circuit Breaker is open - Server is unreachable'));
        }

        const originalRequest = error.config;

        // Initialize retry count
        if (!originalRequest._retryCount) {
            originalRequest._retryCount = 0;
        }

        // Configuration
        const MAX_RETRIES = 3;
        const INITIAL_BACKOFF = 1000; // 1 second

        // Check if error is retryable (Network Error or 5xx Server Error)
        const isNetworkError = !error.response || error.code === 'ERR_CONNECTION_REFUSED';
        const isServerError = error.response && error.response.status >= 500;

        // Don't retry if it's a 4xx error (Client Error) or 401 (Auth)
        const isClientError = error.response && error.response.status >= 400 && error.response.status < 500;

        if (isNetworkError || isServerError) {
            failureCount++;
            if (failureCount >= FAILURE_THRESHOLD) {
                console.error(`[API] Circuit Breaker OPENED (${failureCount} failures). Pausing requests.`);
                isCircuitOpen = true;
                setTimeout(() => {
                    console.log('[API] Circuit Breaker RESET. Resuming requests.');
                    isCircuitOpen = false;
                    failureCount = 0;
                }, CIRCUIT_RESET_TIME);
                return Promise.reject(error);
            }
        }

        if ((isNetworkError || isServerError) && !isClientError && originalRequest._retryCount < MAX_RETRIES) {
            originalRequest._retryCount++;

            // Calculate delay with exponential backoff
            const delay = INITIAL_BACKOFF * Math.pow(2, originalRequest._retryCount - 1);

            console.warn(`[API] Connection failed. Retrying (${originalRequest._retryCount}/${MAX_RETRIES}) in ${delay}ms...`);

            // Wait for the delay
            await new Promise(resolve => setTimeout(resolve, delay));

            // Retry the request
            return api(originalRequest);
        }

        if (error.response?.status === 401) {
            // Optional: Redirect to login or clear token
            // window.location.href = '/login'; 
            console.warn('Unauthorized - Token may be invalid');
        }
        return Promise.reject(error);
    }
);

export default api;
