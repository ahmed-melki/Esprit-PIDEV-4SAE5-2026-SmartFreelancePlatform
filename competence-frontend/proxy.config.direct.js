// Proxy direct vers le backend (sans gateway ni Eureka).
// Les appels /api/competence/* sont envoyés vers http://localhost:8089/Competence/*
// Usage : ng serve -c direct  (ou modifier angular.json pour utiliser ce fichier par défaut)

const PROXY_CONFIG = {
  '/api/competence': {
    target: 'http://localhost:8089',
    secure: false,
    changeOrigin: true,
    pathRewrite: { '^/api/competence': '' },
    logLevel: 'debug',
  },
  '/users/**': {
    target: 'https://api.github.com',
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
  },
};

module.exports = PROXY_CONFIG;
