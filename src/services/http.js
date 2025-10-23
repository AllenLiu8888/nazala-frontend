// Networking base layer - wraps fetch and error handling
// Smartly determine API base URL:
// 1. Prefer environment variable VITE_API_BASE_URL (if set)
// 2. Otherwise infer from current location:
//    - localhost → local dev API (http://127.0.0.1:8001)
//    - others → current host/IP with port 8001
const getApiBaseUrl = () => {
    // Prefer environment variable if configured
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Auto-detect: use local API when on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://127.0.0.1:8001';
    }
    
    // Otherwise use current host with port 8001
    const protocol = window.location.protocol; // 'http:' or 'https:'
    const hostname = window.location.hostname;  // IP or domain
    return `${protocol}//${hostname}:8001`;
};

const API_BASE_URL = getApiBaseUrl();

class APIError extends Error {
    constructor(message, status, code) {
        super(message);
        this.name = 'APIError';
        this.status = status; // HTTP status code (e.g., 400/500)
        this.code = code; // Business error code (e.g., 'HTTP_ERROR' / 'BUSINESS_ERROR')
    }
}

// Unified HTTP request wrapper
export const http = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers || {},
        },
        ...options,
        };

    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            // Try to parse backend error payload
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
                console.error('Backend error detail:', errorData);
            } catch {
                // If JSON parsing fails, keep default error message
            }
            
            throw new APIError(
                errorMessage,
                response.status,
                'HTTP_ERROR'
            );
        }

        const data = await response.json();
        
      // Check backend business status
        if (data.status === false) {
            throw new APIError(data.error || 'Business logic error', 400, 'BUSINESS_ERROR');
        }
        return data.data; // Return the data section directly

    } catch (error) {
        console.error(`API error:`, error);
        throw error;
        }
    },

  // GET request
    get(endpoint, token = null) {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        return this.request(endpoint, { method: 'GET', headers });
    },

  // POST request
    post(endpoint, body = null, token = null, customHeaders = {}) {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        return this.request(endpoint, {
        method: 'POST',
        headers: { ...headers, ...customHeaders },
        body: body ? JSON.stringify(body) : null,
        });
    },
};

export { APIError };
