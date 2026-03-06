import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.VITE_API_BASE_URL || "http://localhost:8080";

  return {
    plugins: [react()],
    // [중요] Recharts가 필요한 react-is를 미리 준비시킵니다.
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
            // [중요] react 관련 모든 부품을 'react-vendor' 하나로 묶어 forwardRef 에러를 방지합니다.
            if (
              id.includes("react-dom") || 
              id.includes("react-is") || 
              id.includes("/react/") ||
              id.includes("scheduler")
            ) {
              return "react-vendor";
            }
            if (id.includes("react-router")) return "router";
            if (id.includes("recharts")) return "recharts-vendor";
            return "vendor";
          },
        },
      },
    },
  };
});
