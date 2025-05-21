/** @format */

import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  base: '/madar-manteghi/',
  plugins: [preact()],
  build: {
    outDir: 'dist'
  }
})
