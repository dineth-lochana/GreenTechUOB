import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
/* eslint-disable */
export default defineConfig({
  plugins: [react()],
  base: '',
  define: {
    'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_FIREBASE_API_KEY),
    'process.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY),
    'process.env.VITE_Chatling_API_KEY': JSON.stringify(process.env.VITE_Chatling_API_KEY)
  },
  test: { 
    globals: true,
    environment: 'jsdom'
  }
})
