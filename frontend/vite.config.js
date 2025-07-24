import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(process.cwd(), "src")
      },
    ],
  },
  server: {
    allowedHosts: ['.ngrok-free.app'],
  }
});