import axios from 'axios';
import { getAccessToken, clearAuth } from '../utils/authStorage';

// [수정] 환경에 따라 백엔드 주소(8080 포트)를 자동으로 결정합니다.
function resolveApiBaseUrl() {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return "http://localhost:8080"; // 로컬 환경
  }
  // 실제 배포된 EC2 IP와 백엔드 포트 8080 (16.184.21.196)
  return "http://16.184.21.196:8080"; 
}

const axiosInstance = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 인터셉터: 요청 시 토큰 주입
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 인터셉터: 응답 에러(401 등) 처리
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      // 필요 시 로그인 페이지로 리다이렉트 로직 추가 가능
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
