const cacheName = 'GolfuX';
const ASSETS = [
    'https://immense-savannah-78341.herokuapp.com/textures/ball.png',
    'https://immense-savannah-78341.herokuapp.com/textures/bubblegum.png',
    'https://immense-savannah-78341.herokuapp.comtextures/ice.jpg',
    'https://immense-savannah-78341.herokuapp.comtextures/lava.png',
    'https://immense-savannah-78341.herokuapp.comtextures/logo.png',
    'https://immense-savannah-78341.herokuapp.comtextures/sand.png',
    'https://immense-savannah-78341.herokuapp.comtextures/void.jpg',
    'https://immense-savannah-78341.herokuapp.comtextures/wall.jpg',
    'https://immense-savannah-78341.herokuapp.comtextures/water.jpg',
    'https://immense-savannah-78341.herokuapp.comtextures/wind.png',
    'https://immense-savannah-78341.herokuapp.comstyles/golfux.css',
    'https://immense-savannah-78341.herokuapp.comsounds/bonk.mp3',
    'https://immense-savannah-78341.herokuapp.comsounds/hole.mp3',
    'https://immense-savannah-78341.herokuapp.comsounds/ice.mp3',
    'https://immense-savannah-78341.herokuapp.comsounds/lava.mp3',
    'https://immense-savannah-78341.herokuapp.comsounds/sand.mp3',
    'https://immense-savannah-78341.herokuapp.comsounds/shoot.mp3',
    'https://immense-savannah-78341.herokuapp.comsounds/water.mp3',
    'https://immense-savannah-78341.herokuapp.comhelpers/embox2d-helpers.js',
    'https://immense-savannah-78341.herokuapp.comhelpers/embox2d-html5canvas-debugDraw.js',
    'https://immense-savannah-78341.herokuapp.combuild/Box2D_v2.2.1_min.js',
    'https://immense-savannah-78341.herokuapp.combuild/Box2D_v2.2.1_min.wasm.js',
    'https://immense-savannah-78341.herokuapp.combuild/Box2D_v2.2.1_min.wasm.wasm',
    'https://immense-savannah-78341.herokuapp.combuild/Box2D_v2.3.1_min.js',
    'https://immense-savannah-78341.herokuapp.combuild/Box2D_v2.3.1_min.wasm.js',
    'https://immense-savannah-78341.herokuapp.combuild/Box2D_v2.3.1_min.wasm.wasm',
    'https://immense-savannah-78341.herokuapp.comball.js',
    'https://immense-savannah-78341.herokuapp.comgolfux.js',
    'https://immense-savannah-78341.herokuapp.comhole.js',
    'https://immense-savannah-78341.herokuapp.comindex.js',
    'https://immense-savannah-78341.herokuapp.comlevel.js',
    'https://immense-savannah-78341.herokuapp.comObstacle.js',
];

const levels = []
for(var i = 1 ; i<29 ; ++i){
    levels.push('https://immense-savannah-78341.herokuapp.comlevels/solo/level'+i+'.json');
}

const contentToCache = ASSETS.concat(levels);

self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    e.waitUntil((async () => {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: GolfuX files');
      await cache.addAll(contentToCache);
    })());
});


/*self.addEventListener("fetch", event => {
    console.log("Fetched " + event.url);
    if (event.request.url === "https://immense-savannah-78341.herokuapp.com/") {
        event.respondWith(
            fetch(event.request).catch(err =>
                self.cache.open(cacheName).then(cache => cache.match("/offline.html"))
            )
        );
    } else {
        event.respondWith(
            fetch(event.request).catch(err =>
                caches.match(event.request).then(response => response)
            )
        );
    }
});*/