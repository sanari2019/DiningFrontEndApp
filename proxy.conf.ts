const PROXY_CONFIG = [
  {
    context: ['/api'],
    target: 'http://localhost:7146',
    secure: false,
    logLevel: 'debug',
  }
];

module.exports = PROXY_CONFIG;
