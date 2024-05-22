import react from '@vitejs/plugin-react-swc'
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.REACT_APP_DEV_URL': JSON.stringify(env.REACT_APP_DEV_URL),
      'process.env.REACT_APP_PROD_URL': JSON.stringify(env.REACT_APP_PROD_URL),
    },
    plugins: [react()],
  }
})
