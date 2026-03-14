import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const AUTH_PATHS = ['/auth/register', '/auth/authenticate'];

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token
client.interceptors.request.use(
    (config) => {
        const requestPath = config.url || '';
        const isAuthRequest = AUTH_PATHS.some((path) => requestPath.includes(path));

        if (typeof window !== 'undefined' && isAuthRequest) {
            delete config.headers.Authorization;
            return config;
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token && !isAuthRequest) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default client;
