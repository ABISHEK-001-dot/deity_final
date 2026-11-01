import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const disableHmr = env.DISABLE_HMR !== 'false';
  // Use IPv4 explicitly: on some Windows DNS configurations `localhost`
  // resolves to several unavailable addresses and Vite's proxy exhausts its
  // connection buffer (ENOBUFS).
  const backendTarget = env.VITE_API_URL || `http://127.0.0.1:${env.PORT || '3000'}`;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: disableHmr ? false : true,
      watch: disableHmr ? null : {},
      // Lets `vite` (port 5173) use the same relative /api URLs as the
      // integrated Express development server and deployed application.
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
