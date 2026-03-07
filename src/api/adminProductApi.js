import axios from 'axios';
import { getAccessToken, clearAuth } from '../utils/authStorage';

// [수정] 접속 환경에 따라 백엔드 주소(8080 포트)를 자동으로 결정합니다.
function resolveApiBaseUrl() {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return "http://localhost:8080"; // 로컬 환경
  }
  // 실제 배포된 EC2 IP와 백엔드 포트 8080
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

// 기존의 interceptors 로직이 있다면 그대로 유지하면서 아래 'http' 객체를 export 하세요.
export const http = {
  get: (url, config) => instance.get(url, config),
  post: (url, data, config) => instance.post(url, data, config),
  put: (url, data, config) => instance.put(url, data, config),
  del: (url, config) => instance.delete(url, config), // delete를 del로 매핑
};

export default instance;
