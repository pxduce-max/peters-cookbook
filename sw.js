const CACHE_NAME = 'peters-cookbook-v2';
const PRECACHE_URLS = [
  "./",
  "./app.js",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./index.html",
  "./install.js",
  "./manifest.webmanifest",
  "./pdfs/Creamy_Peanut_Udon_with_Sticky_Tempeh.pdf",
  "./pdfs/Creamy_Swedish_Saffron_Fish_Soup.pdf",
  "./pdfs/Eight_Easy_Weeknight_Recipes.pdf",
  "./pdfs/Finnish_Salmon_Soup_Lohikeitto.pdf",
  "./pdfs/Hot_Smoked_Salmon_Spinach_Capers_Pasta_Bake.pdf",
  "./pdfs/Improved_Tofu_Reuben_Toastie.pdf",
  "./pdfs/Japanese_Curry_Udon_Improved_Recipe.pdf",
  "./pdfs/Korean_Slow_Braised_Boneless_Beef_Galbi_Jjim.pdf",
  "./pdfs/Skansk_Kalops_Beef_Shin.pdf",
  "./pdfs/Slow_Cooked_Beef_Stroganoff.pdf",
  "./pdfs/Smoked_Haddock_Plokkfiskur.pdf",
  "./pdfs/Sticky_Honey_Chilli_Peanut_Chicken.pdf",
  "./pdfs/Ultimate_Winter_Goulash_Soup_with_Garlic_Bread.pdf",
  "./pdfs/creamy_pesto_chickpea_pasta_refined.pdf",
  "./pdfs/foraged_blackberry_recipes.pdf",
  "./pdfs/greek_style_lemon_chicken_orzo_soup_refined.pdf",
  "./pdfs/marry_me_chicken_best_version.pdf",
  "./pdfs/mushroom_lentil_gnocchi_ragu.pdf",
  "./pdfs/root_vegetable_red_lentil_soup_refined.pdf",
  "./pdfs/salmon_traybake_soy_chilli_lime_refined.pdf",
  "./pdfs/soothing_chicken_pearl_barley_soup_refined.pdf",
  "./pdfs/spiced_cauliflower_lentils_tahini_yoghurt_air_fryer.pdf",
  "./pdfs/wild_rice_mushroom_soup_refined.pdf",
  "./recipes.js",
  "./style.css"
];
const SCOPE_URL = new URL('./', self.location.href);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key =>
      key.startsWith('peters-cookbook-') && key !== CACHE_NAME
    ).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' ||
      url.origin !== SCOPE_URL.origin ||
      !url.pathname.startsWith(SCOPE_URL.pathname)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request, {ignoreSearch: true});
    // Return full cached files, including for offline PDF range requests.
    if (cached) return cached;
    if (event.request.mode === 'navigate') {
      try {
        return await fetch(event.request);
      } catch (error) {
        return await cache.match(new URL('index.html', SCOPE_URL));
      }
    }
    return fetch(event.request);
  })());
});
