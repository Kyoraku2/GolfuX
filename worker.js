const cacheName = 'GolfuX';
const ASSETS = [
    '/textures/ball.png',
    '/textures/bubblegum.png',
    '/textures/ice.jpg',
    '/textures/lava.png',
    '/textures/logo.PNG',
    '/textures/sand.png',
    '/textures/void.jpg',
    '/textures/wall.jpg',
    '/textures/water.jpg',
    '/textures/wind.png',
    '/styles/golfux.css',
    '/sounds/bonk.mp3',
    '/sounds/hole.mp3',
    '/sounds/ice.mp3',
    '/sounds/lava.mp3',
    '/sounds/sand.mp3',
    '/sounds/shoot.mp3',
    '/sounds/water.mp3',
    '/helpers/embox2d-helpers.js',
    '/helpers/embox2d-html5canvas-debugDraw.js',
    '/build/Box2D_v2.2.1_min.js',
    '/build/Box2D_v2.2.1_min.wasm.js',
    '/build/Box2D_v2.2.1_min.wasm.wasm',
    '/build/Box2D_v2.3.1_min.js',
    '/build/Box2D_v2.3.1_min.wasm.js',
    '/build/Box2D_v2.3.1_min.wasm.wasm',
    '/ball.js',
    '/golfux.js',
    '/hole.js',
    '/index.js',
    '/level.js',
    '/Obstacle.js'
];

const levels = []
for(var i = 1 ; i<29 ; ++i){
    levels.push('/levels/solo/level'+i+'.json');
}

const contentToCache = ASSETS.concat(levels);

self.addEventListener('install', (e) => {
    //console.log('[Service Worker] Install');
    e.waitUntil((async () => {
      const cache = await caches.open(cacheName);
      //console.log('[Service Worker] Caching all: GolfuX files');
      await cache.addAll(contentToCache);
    })());
});


self.addEventListener('fetch', (e) => {
    e.respondWith((async () => {
      const r = await caches.match(e.request);
      //console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (r) { return r; }
      const response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      //console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })());
  });