import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.VITE_API_BASE_URL || "http://localhost:8080";

  return {
    plugins: [react()],
    optimizeDeps: {
      // recharts와 그 부속 부품들을 빌드 전에 미리 준비시킵니다.
      include: ["recharts", "react-is"],
    },
    server: {
      proxy: {
        "/api": { target: backend, changeOrigin: true },
        "/images": { target: backend, changeOrigin: true },
      },
    },
    build: {
      commonjsOptions: {
        // react-is 같은 CommonJS 모듈을 Vite가 정상적으로 처리하도록 설정합니다.
        include: [/node_modules/],
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            // react 핵심과 react-is를 한 덩어리로 묶어 버전 갈등을 방지합니다.
            if (id.includes("react-dom") || id.includes("react") || id.includes("react-is")) {
              return "react-vendor";
            }
            if (id.includes("react-router-dom") || id.includes("react-router")) return "router";
            if (id.includes("axios")) return "axios";
            if (id.includes("recharts")) return "recharts-vendor";
            return "vendor";
          },
        },
      },
    },
  };
});
