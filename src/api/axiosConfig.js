import axios from 'axios';

const api = axios.create({
    // 🚩 IMPORTANT: /api-ah thookittu base URL-ah mattum vaiyunga
    baseURL: 'https://maxim-unbrushed-arie.ngrok-free.dev',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // ✅ Bypass ngrok warning
        config.headers['ngrok-skip-browser-warning'] = 'true';
        // ✅ Ensure Content-Type is set for POST requests
        config.headers['Content-Type'] = 'application/json';

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;