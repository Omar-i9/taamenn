import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'TAAMEN_');
  return {
    plugins: [react()],
    server: {
      /**
       * Development convenience only: it makes the dev server and the API share one
       * origin so the session cookie behaves as it does in a same-origin deployment.
       * This is not a production hosting decision — see docs/DEPLOYMENT.md.
       */
      proxy: {
        '/api': {
          target: env.TAAMEN_BACKEND_ORIGIN || 'http://localhost:8787',
          changeOrigin: false,
        },
      },
    },
  };
});
