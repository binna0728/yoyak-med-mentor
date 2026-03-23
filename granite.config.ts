import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'yoyak',
  brand: {
    displayName: '요약',
    primaryColor: '#7C9A7E',
    icon: 'https://yoyak.site/app-icon.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'vite build',
    },
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
  },
  permissions: [],
});
