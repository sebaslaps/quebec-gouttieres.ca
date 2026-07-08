import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://quebec-gouttieres.ca',
  integrations: [sitemap()],
  output: 'static',
});
