import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'yoyak',
  brand: {
    displayName: '요약',
    primaryColor: '#7C9A7E',
    icon: '',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'vite build',
    },
  },
  permissions: [],
});
