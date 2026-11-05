import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/Sistema_Gestion_Hotelera/',
  plugins: [react()],
})
