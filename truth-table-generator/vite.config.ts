/** @format */

import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  base: '/truth-table-generator/',
  plugins: [preact()],
  build: {
    outDir: 'docs'
  }
})
