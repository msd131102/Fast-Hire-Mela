import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    historyApiFallback: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            if (id.includes('react-hot-toast')) {
              return 'ui-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            return 'vendor';
          }
          
          // Feature chunks
          if (id.includes('/src/pages/')) {
            if (id.includes('Login') || id.includes('Signup')) {
              return 'auth-chunk';
            }
            if (id.includes('Dashboard') || id.includes('Analytics')) {
              return 'dashboard-chunk';
            }
            if (id.includes('JobsManagement') || id.includes('CategoriesManagement') || 
                id.includes('CompaniesManagement') || id.includes('LocationsManagement') ||
                id.includes('UsersManagement') || id.includes('RolesManagement')) {
              return 'management-chunk';
            }
            if (id.includes('PagesManagement') || id.includes('SEOManagement') || 
                id.includes('MediaManagement') || id.includes('FAQManagement')) {
              return 'content-chunk';
            }
            return 'admin-chunk';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
