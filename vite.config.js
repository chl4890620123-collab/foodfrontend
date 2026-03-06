import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.VITE_API_BASE_URL || "http://localhost:8080";

  return {
    plugins: [react()],
    // recharts와 react-is를 빌드 전에 미리 준비시킵니다.
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
      // react-is 같은 옛날 방식의 모듈을 Vite가 읽을 수 있게 합니다.
      commonjsOptions: {
        include: [/node_modules/],
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            // react 핵심 부품들을 하나로 묶어 'Activity' 설정 에러를 방지합니다.
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
