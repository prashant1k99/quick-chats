import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: "../server/public"
  },
  server: {
    proxy: {
      "/api": "http://localhost:8080",
      "/socket": {
        target: "http://localhost:8080",
        ws: true
      }
    },
    port: 3000
  }
})
