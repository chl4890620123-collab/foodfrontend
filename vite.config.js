import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.VITE_API_BASE_URL || "http://localhost:8080";

  return {
    plugins: [react()],
    // [추가] React 19와 Recharts의 호환성을 위해 빌드 전 의존성을 미리 최적화합니다.
    optimizeDeps: {
      include: ["recharts", "react-is"],
    },
    server: {
      proxy: {
        "/api": { target: backend, changeOrigin: true },
        "/images": { target: backend, changeOrigin: true },
      },
    },
    build: {
      // [추가] CommonJS 기반인 react-is를 Vite가 제대로 읽을 수 있도록 허용합니다.
      commonjsOptions: {
        include: [/node_modules/],
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            
            // [수정] react-is를 react-vendor 청크에 함께 묶어 버전 갈등을 방지합니다.
            if (
              id.includes("react-dom") || 
              id.includes("react") || 
              id.includes("react-is")
            ) {
              return "react-vendor";
            }
            
            if (id.includes("react-router-dom") || id.includes("react-router")) return "router";
            if (id.includes("axios")) return "axios";
            // [수정] recharts도 별도 청크로 빼서 로딩 순서를 명확히 합니다.
            if (id.includes("recharts")) return "recharts-vendor";
            
            return "vendor";
          },
        },
      },
    },
  };
});
