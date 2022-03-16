const cacheName = 'GolfuX-v3';
const STRUCT = [
  '/textures/ball.png',
  '/textures/ball_pink.png',
  '/textures/ball_red.png',
  '/textures/ball_blue.png',
  '/textures/bubblegum.png',
  '/textures/ice.jpg',
  '/textures/lava.png',
  '/textures/logo.PNG',
  '/textures/grux.png',
  '/textures/sand.png',
  '/textures/trophux.png',
  '/textures/void.jpg',
  '/textures/wall.jpg',
  '/textures/water.jpg',
  '/textures/wind.png',
  '/styles/golfux.css',
  '/sounds/bonk.mp3',
  '/sounds/hole.mp3',
  '/sounds/lava.mp3',
  '/sounds/sand.mp3',
  '/sounds/shoot.mp3',
  '/sounds/water.mp3',
  '/sounds/ice.mp3',
  '/sounds/bubblegum.mp3',
  '/sounds/wind.mp3',
  '/sounds/portal7.mp3',
  '/index.html',
  'favicon.ico'
];
const ASSETS = [
  '/helpers/embox2d-helpers.js',
  '/helpers/embox2d-html5canvas-debugDraw.js',
  '/build/Box2D_v2.2.1_min.js',
  '/build/Box2D_v2.2.1_min.wasm.js',
  '/build/Box2D_v2.2.1_min.wasm.wasm',
  '/build/Box2D_v2.3.1_min.js',
  '/build/Box2D_v2.3.1_min.wasm.js',
  '/build/Box2D_v2.3.1_min.wasm.wasm',
  '/ball.js',
  '/confetti.js',
  '/golfux.js',
  '/hole.js',
  '/index.js',
  '/level.js',
  '/Obstacle.js',
];

const levels = []
for(var i = 1 ; i<=40 ; ++i){
  levels.push('/levels/solo/level'+i+'.json');
}
for(var i = 1 ; i<=29 ; ++i){
  levels.push('/levels/multi/level'+i+'.json');
}

const contentToCache = STRUCT.concat(levels);

self.addEventListener('install', function(e) {
  console.log('[Service Worker] Install');
  e.waitUntil(caches.open(cacheName).then(function(cache) {
      console.log('[Service Worker] Caching application content & data');
      return cache.addAll(contentToCache);
  }));
});

self.addEventListener('fetch', (e) => {
  // Stratégie initiale : cache ou network avec mise en cache (le "false &&" empêche son application) 
  false && e.respondWith(
    caches.match(e.request).then((r) => {
      console.log('[Service Worker] Fetching resource: '+e.request.url);
        return r || fetch(e.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching new resource: '+e.request.url);
            cache.put(e.request, response.clone());
            return response;
        });
      });
    })
  );
  
  // Stratégie cache-only
  if(contentToCache.some(file => e.request.url.endsWith(file.substring(2)))) {
    console.log('[Service Worker] Loading from cache: '+e.request.url);
    e.respondWith(caches.match(e.request));
  }else {
    // Stratégie network + mise en cache, ou alors cache, ou réponse par défaut  
    e.respondWith(fetch(e.request)
      .then((response) => {
        return caches.open(cacheName).then((cache) => {
          console.log('[Service Worker] Fetching from network and caching resource: '+e.request.url);
          cache.put(e.request, response.clone());
          return response;
        });
      })
      .catch(function() { 
        return caches.match(e.request).then((r) => {
          console.log('[Service Worker] Looking for resource in cache: '+e.request.url);
          return r; // || new Response(JSON.stringify({ error: 1 }), { headers: { 'Content-Type': 'application/json' } }); <-- si on veut renvoyer un JSON indiquant l'erreur au lieu de laisser une erreur d'accès être capturée par l'application. 
        })
      })
    );
  }
});


self.addEventListener('activate', (e) => {
  e.waitUntil(
      // cleaning previous caches
      caches.keys().then((keyList) => {
          return Promise.all(keyList.map((key) => {
              if(cacheName.indexOf(key) === -1) {
                  console.log("[Service Worker] Cleaning old cache");
                  return caches.delete(key);
              }
        }));
      })
  );
});