import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The storefront (willow_fe) runs on 5173; the seller panel runs alongside it on 5174.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
  },
});
