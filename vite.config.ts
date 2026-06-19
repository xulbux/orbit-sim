// oxlint-disable-next-line import/no-nodejs-modules
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/orbit-sim/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      // oxlint-disable-next-line unicorn/prefer-module
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
