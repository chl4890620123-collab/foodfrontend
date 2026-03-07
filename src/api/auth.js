import axios from 'axios';
import { getAccessToken, clearAuth } from '../utils/authStorage';

// [수정] 환경에 따라 백엔드(8080 포트) 주소를 정확히 반환합니다.
function resolveApiBaseUrl() {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return "http://localhost:8080";
  }
  // 실제 배포된 EC2 IP와 백엔드 포트 8080 필수
  return "http://16.184.21.196:8080"; 
}

const instance = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 인터셉터 설정 (토큰 주입 및 401 에러 처리)
instance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// [핵심] 기존 productApi 등이 사용하는 .get, .post 형식을 유지하기 위한 export
export const http = {
  get: (url, config) => instance.get(url, config),
  post: (url, data, config) => instance.post(url, data, config),
  put: (url, data, config) => instance.put(url, data, config),
  del: (url, config) => instance.delete(url, config),
};

export default instance;
