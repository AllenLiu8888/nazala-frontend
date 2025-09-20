// 网络基础层 - 封装 fetch 和错误处理
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

class APIError extends Error {
    constructor(message, status, code) {
        super(message);
        this.name = 'APIError';
        this.status = status; // HTTP 状态码（如 400/500）
        this.code = code; // 业务错误码标识（如 'HTTP_ERROR' / 'BUSINESS_ERROR'）
    }
}

// 统一的 HTTP 请求封装
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
        console.log(`🌐 API request: ${config.method || 'GET'} ${url}`);
        
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new APIError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            'HTTP_ERROR'
            );
        }

        const data = await response.json();
        
      // 检查后端业务状态
        if (data.status === false) {
            throw new APIError(data.error || 'Business logic error', 400, 'BUSINESS_ERROR');
        }

        console.log(`✅ API response:`, data);
        return data.data; // 直接返回 data 部分

    } catch (error) {
        console.error(`❌ API error:`, error);
        throw error;
        }
    },

  // GET 请求
    get(endpoint, token = null) {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        return this.request(endpoint, { method: 'GET', headers });
    },

  // POST 请求
    post(endpoint, body = null, token = null) {
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        return this.request(endpoint, {
        method: 'POST',
        headers,
        body: body ? JSON.stringify(body) : null,
        });
    },
};

export { APIError };
