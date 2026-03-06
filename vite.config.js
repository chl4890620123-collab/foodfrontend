import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.VITE_API_BASE_URL || "http://localhost:8080";

  return {
    plugins: [react()],
    // [핵심] 빌드 로봇이 recharts와 react-is를 미리 인식하도록 합니다.
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
      // [핵심] 옛날 방식의 react-is를 최신 방식으로 변환해 빌드에 포함합니다.
      commonjsOptions: {
        include: [/node_modules/],
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            // react 관련 부품들을 하나로 묶어 forwardRef 에러를 원천 봉쇄합니다.
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
