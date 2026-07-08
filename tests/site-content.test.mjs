import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const file = (...parts) => join(root, ...parts);
const read = (...parts) => readFileSync(file(...parts), 'utf8');

const requiredFiles = [
  'package.json',
  'astro.config.mjs',
  'netlify.toml',
  'src/data/site.json',
  'src/data/service-pages.json',
  'src/layouts/BaseLayout.astro',
  'src/pages/index.astro',
  'src/pages/[slug].astro',
  'public/robots.txt',
  'public/favicon.svg',
];

test('required project files exist', () => {
  for (const path of requiredFiles) {
    assert.ok(existsSync(file(path)), `${path} should exist`);
  }
});

test('site data targets Quebec City CMA gutter services in Quebec French', () => {
  const site = JSON.parse(read('src/data/site.json'));
  assert.equal(site.name, 'Québec Gouttières');
  assert.equal(site.domain, 'quebec-gouttieres.ca');
  assert.equal(site.language, 'fr-CA');
  assert.match(site.title, /gouttières.+Québec/i);
  assert.match(site.metaDescription, /Québec|Lévis|Rive-Sud/i);
  assert.deepEqual(site.services.map((service) => service.slug), [
    'installation-gouttieres-sans-joints',
    'nettoyage-gouttieres',
    'pare-feuilles',
  ]);
  for (const area of ['Québec', 'Lévis', 'Sainte-Foy', 'Beauport', 'Charlesbourg', 'Rive-Sud']) {
    assert.ok(site.serviceAreas.includes(area), `${area} should be a service area`);
  }
});

test('homepage contains localized hero, climate pitch, services overview and CTA', () => {
  const home = read('src/pages/index.astro');
  assert.match(home, /Expert en gouttières à Québec et Lévis/);
  assert.match(home, /climat de Québec/i);
  assert.match(home, /neige/);
  assert.match(home, /glace/);
  assert.match(home, /gel-dégel/);
  assert.match(home, /Soumission gratuite/);
  assert.match(home, /Installation de gouttières sans joints/);
  assert.match(home, /Nettoyage professionnel de gouttières/);
  assert.match(home, /Protection pare-feuilles/);
  assert.match(home, /infiltration d’eau/i);
  assert.match(home, /fondations/);
  assert.match(home, /toiture/);
  assert.match(home, /gouttières en aluminium sans joints/);
  assert.match(home, /système de crochets continus/);
  assert.match(home, /Alu-Rex T-Rex/);
  assert.match(home, /DoublePro/);
  assert.match(home, /50\s*% plus robustes/);
  assert.match(home, /250 à 425 lb par pied linéaire/);
  for (const area of ['Lévis', 'Sainte-Foy', 'Beauport', 'Charlesbourg', 'Rive-Sud']) {
    assert.match(home, new RegExp(area));
  }
});

test('core service pages are data-driven with unique persuasive French copy', () => {
  const pages = JSON.parse(read('src/data/service-pages.json'));
  assert.equal(pages.length, 3);
  const bySlug = Object.fromEntries(pages.map((page) => [page.slug, page]));

  assert.match(bySlug['installation-gouttieres-sans-joints'].h1, /gouttières sans joints/i);
  assert.match(bySlug['installation-gouttieres-sans-joints'].body, /5 et 6 pouces/);
  assert.match(bySlug['installation-gouttieres-sans-joints'].body, /joints sont la première cause/i);
  assert.match(bySlug['installation-gouttieres-sans-joints'].body, /rouille|fuites d’eau/i);
  assert.match(bySlug['installation-gouttieres-sans-joints'].body, /près de 30 ans/);

  assert.match(bySlug['nettoyage-gouttieres'].h1, /Nettoyage de gouttières/i);
  assert.match(bySlug['nettoyage-gouttieres'].body, /débris|feuilles|aiguilles/i);
  assert.match(bySlug['nettoyage-gouttieres'].body, /barrages de glace|poches de glace/i);
  assert.match(bySlug['nettoyage-gouttieres'].body, /sécuritaire|équipe expérimentée/i);

  assert.match(bySlug['pare-feuilles'].h1, /pare-feuilles/i);
  assert.match(bySlug['pare-feuilles'].body, /microfiltration|micro-filtration/i);
  assert.match(bySlug['pare-feuilles'].body, /Alu-Rex T-Rex/);
  assert.match(bySlug['pare-feuilles'].body, /DoublePro/);
  assert.match(bySlug['pare-feuilles'].body, /250 à 425 lb par pied linéaire/);

  for (const page of pages) {
    assert.match(page.title, /Québec|Lévis|Rive-Sud/);
    assert.match(page.metaDescription, /soumission gratuite|Québec|Lévis/i);
    assert.match(page.cta, /Soumission gratuite/);
    assert.ok(page.body.length > 1200, `${page.slug} should have substantial copy`);
  }
});

test('shared layout is conversion-focused and avoids fake trust claims', () => {
  const layout = read('src/layouts/BaseLayout.astro');
  assert.match(layout, /Québec Gouttières/);
  assert.match(layout, /fr-CA/);
  assert.match(layout, /Soumission gratuite/);
  assert.match(layout, /mailto:info@quebec-gouttieres.ca/);
  assert.doesNotMatch(layout, /avis|étoiles|Google|RBQ|assuré/i);
});

test('robots file points to quebec-gouttieres.ca sitemap', () => {
  const robots = read('public/robots.txt');
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/quebec-gouttieres\.ca\/sitemap-index\.xml/);
});
