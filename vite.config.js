import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const backend = new URL(env.VITE_BASE_FORUM_LOST_URL || env.VITE_API_BASE_URL || 'https://forum-istad-api.cheat.casa/api/v1');
  return {
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      '/__forum_api': {
        target: backend.origin,
        changeOrigin: true,
        rewrite: requestPath => requestPath.replace(/^\/__forum_api/, backend.pathname.replace(/\/+$/, '')),
        configure: proxy => {
          // This is a server-to-server request. Keep Authorization intact;
          // the browser's local Origin is not the backend's browser origin.
          proxy.on('proxyReq', proxyRequest => proxyRequest.removeHeader('origin'));
        },
      },
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(
        import.meta.dirname,
        "./src",
      ),
    },
  },
  };
});
