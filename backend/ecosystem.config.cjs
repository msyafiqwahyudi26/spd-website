// PM2 process definition for the SPD backend.
// Usage (from backend/):
//   pm2 start ecosystem.config.cjs --env production
//   pm2 save
//   pm2 startup     # follow the printed command to persist on reboot
//
// Notes:
//  - The in-memory rate limiter and view-dedup store are per-process.
//    DO NOT scale instances > 1 until those are moved to Redis.
//  - Env values come from backend/.env at runtime (loaded by dotenv).
//    This file only sets NODE_ENV so the backend picks the right
//    runtime mode; secrets stay in .env.

module.exports = {
  apps: [
    {
      name: 'spd-backend',
      cwd: __dirname,
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '400M',
      kill_timeout: 5000,
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/error.log',
      out_file:   './logs/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
    },
  ],
};
