const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite uses its WebAssembly worker on web.
config.resolver.assetExts.push('wasm');

// SharedArrayBuffer is required by expo-sqlite on web. These headers keep the
// local Metro server cross-origin isolated; production hosting must send the
// same headers.
config.server.enhanceMiddleware = (middleware) => (request, response, next) => {
  response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  return middleware(request, response, next);
};

module.exports = config;
