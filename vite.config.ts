import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';

export default defineConfig(({ command, mode, isPreview }) => {
  const env = loadEnv(mode, '.', 'TAAMEN_');
  // `npm run dev` stays a plain Vite SPA that proxies /api to the Node backend.
  // Cloudflare is used for production builds and `npm run preview` only.
  const useCloudflare = command === 'build' || isPreview === true;
  return {
    plugins: [
      react(),
      ...(useCloudflare ? [cloudflare()] : []),
    ],
    server: useCloudflare
      ? undefined
      : {
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
