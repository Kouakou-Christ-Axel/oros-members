module.exports = {
  apps: [
    {
      name: "oros",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3333",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3333,
      },
    },
  ],
};
