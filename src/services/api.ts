import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';

// 配置API基础URL - 根据平台自动选择
const API_BASE_URL = Platform.select({
  ios: 'http://localhost:3005', // iOS模拟器使用localhost
  android: 'http://10.0.2.2:3005', // Android模拟器使用10.0.2.2
  default: 'http://localhost:3005',
});

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // 服务器返回错误
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // 请求发送但没有收到响应
      console.error('Network Error:', error.request);
    } else {
      // 其他错误
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  },
);

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
    };
    token: string;
    sdk?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
}

export interface DeeplinkResponse {
  success: boolean;
  message: string;
  data: {
    deeplink: string;
    authorizationCode: string;
    expiresIn: number;
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
}

export interface ExchangeTokenResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: {
      id: string;
      email: string;
      name: string;
    };
    sdk: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      accountId: string;
    };
  };
}

// 注册API
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/app/auth/register', data);
  return response.data;
};

// 登录API
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/app/auth/login', data);
  return response.data;
};

// 获取Deeplink API
export const getDeeplink = async (userId: string): Promise<DeeplinkResponse> => {
  const response = await api.post<DeeplinkResponse>('/api/app/auth/deeplink', {
    userId,
  });
  return response.data;
};

// Exchange Token API (模拟 APP B 后端调用)
export const exchangeToken = async (code: string): Promise<ExchangeTokenResponse> => {
  const response = await api.post<ExchangeTokenResponse>('/api/app/auth/exchange-token', {
    code,
  });
  return response.data;
};

export default api;
