import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Optimize babel for production
      babel: {
        compact: true,
      },
    }),
    // Add bundle analyzer in analyze mode
    mode === "analyze" &&
      visualizer({
        open: true,
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),

  // Build optimizations
  build: {
    // Target ES2020 to support BigInt literals and modern JavaScript features
    target: "es2020",

    // Enable minification using esbuild (built into Vite, no extra dependency needed)
    minify: "esbuild",

    // Chunk splitting strategy
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "query-vendor": ["@tanstack/react-query"],
          "ui-vendor": ["antd", "framer-motion", "recharts"],
          "web3-vendor": ["ethers"],
          "utils-vendor": ["axios", "zustand", "sonner"],

          // Feature chunks
          "admin-pages": [
            "./src/features/admin/pages/Dashboard.jsx",
            "./src/features/admin/pages/Registrations.jsx",
            "./src/features/admin/pages/Drugs.jsx",
          ],
          "manufacturer-pages": [
            "./src/features/manufacturer/pages/Dashboard.jsx",
            "./src/features/manufacturer/pages/DrugManagement.jsx",
            "./src/features/manufacturer/pages/ProductionManagement.jsx",
          ],
          "distributor-pages": [
            "./src/features/distributor/pages/Dashboard.jsx",
            "./src/features/distributor/pages/Invoices.jsx",
            "./src/features/distributor/pages/Drugs.jsx",
          ],
          "pharmacy-pages": [
            "./src/features/pharmacy/pages/Dashboard.jsx",
            "./src/features/pharmacy/pages/InvoicesFromDistributor.jsx",
            "./src/features/pharmacy/pages/Drugs.jsx",
          ],
        },
        // Optimize chunk file names
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Source maps for production debugging (optional, disable for smaller builds)
    sourcemap: false,

    // CSS code splitting
    cssCodeSplit: true,

    // Asset inlining threshold (10kb)
    assetsInlineLimit: 10240,
  },

  resolve: {
    alias: [
      {
        find: /^sdp$/,
        replacement: path.resolve(__dirname, "src/shims/sdp-shim.js"),
      },
    ],
  },

  // Optimization settings
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "axios",
      "zustand",
      "ethers",
    ],
    exclude: ["@yudiel/react-qr-scanner", "sdp"],
  },

  // Server configuration
  server: {
    proxy: {
      "/api": {
        target: "https://drug-be.vercel.app",
        changeOrigin: true,
        secure: false,
      },
    },
    // Enable compression
    compress: true,
    // Optimize HMR
    hmr: {
      overlay: true,
    },
  },

  // Preview server optimization
  preview: {
    port: 4173,
    strictPort: true,
    compress: true,
  },

  // Enable esbuild for faster builds
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
    legalComments: "none",
    drop: ["console", "debugger"], // Remove console.logs and debugger statements in production
  },
}));
