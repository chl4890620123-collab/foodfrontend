import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.VITE_API_BASE_URL || "http://localhost:8080";

  return {
    plugins: [react()],
    // Recharts가 사용하는 react-is를 React 19와 동기화
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
      commonjsOptions: {
        include: [/node_modules/],
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            // React 핵심 라이브러리를 하나로 묶어 의존성 꼬임 방지
            if (
              id.includes("react-dom") || 
              id.includes("react-is") || 
              id.includes("/react/") || 
              id.includes("scheduler")
            ) {
              return "react-vendor";
            }
            if (id.includes("recharts")) return "recharts-vendor";
            return "vendor";
          },
        },
      },
    },
  };
});
