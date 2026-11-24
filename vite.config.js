import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxies /api/* -> your Express server (PORT=8080), so no CORS setup is needed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, "") },
    },
  },
});
