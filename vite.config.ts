import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { contentPlugin } from "./vite/content";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), contentPlugin()],
  build: { manifest: true },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
