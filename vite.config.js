import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.VITE_API_BASE_URL || "http://localhost:8080";

  return {
    plugins: [react()],
    // [수정] recharts가 필요한 react-is 부품을 빌드 시 미리 최적화하도록 강제합니다.
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
        // [수정] CommonJS 형식인 react-is를 Vite가 제대로 변환하게 만듭니다.
        include: [/node_modules/],
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            // [수정] react-is를 react-vendor 덩어리에 포함시켜 forwardRef 누락을 방지합니다.
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
