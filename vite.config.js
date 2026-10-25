import { defineConfig } from 'vite';

// Relative paths make the exact same build work in Capacitor and on GitHub Pages.
export default defineConfig({
  base: './',
  // Arena previews are proxied through a changing e2b.app host.
  server: { host: '0.0.0.0', allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
  build: {
    target: 'es2020',
    sourcemap: false,
    assetsInlineLimit: 0
  }
});
