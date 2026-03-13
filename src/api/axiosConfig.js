import axios from 'axios';

const api = axios.create({
    baseURL: 'https://maxim-unbrushed-arie.ngrok-free.dev/api',
});

// Add a request interceptor to attach the JWT token and Ngrok bypass header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        // 1. JWT Token attach pannuvom
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // 2. ✅ Ngrok safety page-ah bypass panna intha header MUKKIYAM!
        config.headers['ngrok-skip-browser-warning'] = 'true';

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;