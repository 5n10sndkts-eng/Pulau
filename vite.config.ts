import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin({ port: 5173 }) as PluginOption,
    // Sentry source maps upload (Story 32.1 - AC #2)
    // Only enabled when SENTRY_AUTH_TOKEN is set (production builds)
    ...(process.env.SENTRY_AUTH_TOKEN
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG || "pulau",
            project: process.env.SENTRY_PROJECT || "pulau-web",
            authToken: process.env.SENTRY_AUTH_TOKEN,
            sourcemaps: {
              filesToDeleteAfterUpload: ["./dist/**/*.map"],
            },
            release: {
              name: `pulau@${process.env.npm_package_version || "0.0.0"}`,
            },
          }),
        ]
      : []),
  ],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    allowedHosts: ['host.docker.internal'],
  },
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  // Enable source maps for production builds (AC #2)
  build: {
    sourcemap: true,
  },
});
