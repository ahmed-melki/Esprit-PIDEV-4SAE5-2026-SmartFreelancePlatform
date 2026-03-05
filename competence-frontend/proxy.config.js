// Proxy direct vers le backend Spring Boot (port 8089).
// Les appels /api/competence/* sont envoyés vers http://localhost:8089/*
// Le préfixe /api/competence est supprimé car server.servlet.context-path est vide.

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
