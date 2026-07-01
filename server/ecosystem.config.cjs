module.exports = {
  "apps": [
    {
      "name": "invest-up-api",
      "script": "index.cjs",
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