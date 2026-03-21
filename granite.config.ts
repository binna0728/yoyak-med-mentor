import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'yoyak',
  brand: {
    displayName: '요약',
    primaryColor: '#7C9A7E',
    icon: '', // TODO: 콘솔 등록 후 정식 아이콘 URL로 교체
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
