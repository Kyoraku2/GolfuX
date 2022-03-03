const cacheName = 'GolfuX';
const ASSETS = [
    'https://immense-savannah-78341.herokuapp.com/textures/ball.png',
    'https://immense-savannah-78341.herokuapp.com/textures/bubblegum.png',
    'https://immense-savannah-78341.herokuapp.com/textures/ice.jpg',
    'https://immense-savannah-78341.herokuapp.com/textures/lava.png',
    'https://immense-savannah-78341.herokuapp.com/textures/logo.png',
    'https://immense-savannah-78341.herokuapp.com/textures/sand.png',
    'https://immense-savannah-78341.herokuapp.com/textures/void.jpg',
    'https://immense-savannah-78341.herokuapp.com/textures/wall.jpg',
    'https://immense-savannah-78341.herokuapp.com/textures/water.jpg',
    'https://immense-savannah-78341.herokuapp.com/textures/wind.png',
    'https://immense-savannah-78341.herokuapp.com/styles/golfux.css',
    'https://immense-savannah-78341.herokuapp.com/sounds/bonk.mp3',
    'https://immense-savannah-78341.herokuapp.com/sounds/hole.mp3',
    'https://immense-savannah-78341.herokuapp.com/sounds/ice.mp3',
    'https://immense-savannah-78341.herokuapp.com/sounds/lava.mp3',
    'https://immense-savannah-78341.herokuapp.com/sounds/sand.mp3',
    'https://immense-savannah-78341.herokuapp.com/sounds/shoot.mp3',
    'https://immense-savannah-78341.herokuapp.com/sounds/water.mp3',
    'https://immense-savannah-78341.herokuapp.com/helpers/embox2d-helpers.js',
    'https://immense-savannah-78341.herokuapp.com/helpers/embox2d-html5canvas-debugDraw.js',
    'https://immense-savannah-78341.herokuapp.com/build/Box2D_v2.2.1_min.js',
    'https://immense-savannah-78341.herokuapp.com/build/Box2D_v2.2.1_min.wasm.js',
    'https://immense-savannah-78341.herokuapp.com/build/Box2D_v2.2.1_min.wasm.wasm',
    'https://immense-savannah-78341.herokuapp.com/build/Box2D_v2.3.1_min.js',
    'https://immense-savannah-78341.herokuapp.com/build/Box2D_v2.3.1_min.wasm.js',
    'https://immense-savannah-78341.herokuapp.com/build/Box2D_v2.3.1_min.wasm.wasm',
    'https://immense-savannah-78341.herokuapp.com/ball.js',
    'https://immense-savannah-78341.herokuapp.com/golfux.js',
    'https://immense-savannah-78341.herokuapp.com/hole.js',
    'https://immense-savannah-78341.herokuapp.com/index.js',
    'https://immense-savannah-78341.herokuapp.com/level.js',
    'https://immense-savannah-78341.herokuapp.com/Obstacle.js',
];

const levels = []
for(var i = 1 ; i<29 ; ++i){
    levels.push('https://immense-savannah-78341.herokuapp.com/levels/solo/level'+i+'.json');
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


