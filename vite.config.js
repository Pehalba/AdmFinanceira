import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Para GitHub Pages: usar base path do repositório
  // O workflow do GitHub Actions define GITHUB_REPOSITORY
  const isGitHubPages = process.env.GITHUB_PAGES === 'true' || mode === 'github-pages';
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'AdmFinanceira';
  const base = isGitHubPages ? `/${repoName}/` : '/';

  // Debug logs (apenas em build, não em dev)
  if (process.env.NODE_ENV === 'production' || isGitHubPages) {
    console.log('[Vite Config] GITHUB_PAGES:', process.env.GITHUB_PAGES);
    console.log('[Vite Config] GITHUB_REPOSITORY:', process.env.GITHUB_REPOSITORY);
    console.log('[Vite Config] Repo Name:', repoName);
    console.log('[Vite Config] Base path:', base);
    console.log('[Vite Config] Mode:', mode);
  }

  return {
    plugins: [react()],
    base: base,
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
    },
  };
})
