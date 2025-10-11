// 网络基础层 - 封装 fetch 和错误处理
// 智能获取 API 地址：
// 1. 优先使用环境变量 VITE_API_BASE_URL（如果配置了）
// 2. 否则根据当前访问地址自动判断：
//    - localhost → 本地开发环境 API (http://127.0.0.1:8001)
//    - 其他地址 → 使用当前域名/IP + 8001 端口
const getApiBaseUrl = () => {
    // 如果配置了环境变量，优先使用
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    
    // 自动判断：如果是 localhost，使用本地 API
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://127.0.0.1:8001';
    }
    
    // 否则使用当前访问地址的主机 + 8001 端口
    const protocol = window.location.protocol; // 'http:' 或 'https:'
    const hostname = window.location.hostname;  // IP 或域名
    return `${protocol}//${hostname}:8001`;
};

const API_BASE_URL = getApiBaseUrl();

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
        const response = await fetch(url, config);
        
        if (!response.ok) {
            // 尝试解析后端返回的错误信息
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
                console.error('后端错误详情:', errorData);
            } catch {
                // 如果无法解析 JSON，使用默认错误信息
            }
            
            throw new APIError(
                errorMessage,
                response.status,
                'HTTP_ERROR'
            );
        }

        const data = await response.json();
        
      // 检查后端业务状态
        if (data.status === false) {
            throw new APIError(data.error || 'Business logic error', 400, 'BUSINESS_ERROR');
        }
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
