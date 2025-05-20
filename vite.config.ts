import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Yasmine-Learn-to-Read/', // Zorg dat dit overeenkomt met je repo naam
})
