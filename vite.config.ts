import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // Saves every app file on the device on the first visit, so the app (and the
    // Play Store version, which opens this site) works fully offline afterwards.
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // public/manifest.webmanifest
      includeAssets: ['icon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'privacy.html'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2,webmanifest}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/privacy\.html$/],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  base: './',
});
