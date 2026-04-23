module.exports = {
  "/api/communication": {
    target: "http://localhost:8082", // Gateway
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      "^/api/communication": "/communication" // /api/communication → /communication
    },
    logLevel: "debug"
  }
};