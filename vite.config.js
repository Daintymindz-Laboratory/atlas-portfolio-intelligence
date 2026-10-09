import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        allOn: fileURLToPath(new URL('./index.html', import.meta.url)),
        atlas: fileURLToPath(new URL('./atlas.html', import.meta.url)),
      },
    },
  },
});
