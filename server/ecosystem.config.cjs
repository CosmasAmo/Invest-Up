module.exports = {
  "apps": [
    {
      "name": "invest-up-api",
      "script": "server.js",
      "instances": 1,
      "autorestart": true,
      "watch": false,
      "max_memory_restart": "1G",
      "env": {
        "NODE_ENV": "production"
      }
    }
  ]
}