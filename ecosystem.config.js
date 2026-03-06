module.exports = {
  apps: [{
    name: 'flyvietnam-help',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/flyvietnam.help',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
