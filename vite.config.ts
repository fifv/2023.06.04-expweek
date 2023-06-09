import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './',
    server: {
        host: '0.0.0.0',
        port: 5233,
        fs: {
            // strict: false,
        },
        // hmr: false,
    },
    optimizeDeps: {
        include: [
            // '/src/test.js'
        ]
    }
})
