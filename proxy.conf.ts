const PROXY_CONFIG = [
  {
    context: ['/api'],
    target: 'https://cafeteriaapi.evercare.ng:2020',
    secure: false,
    logLevel: 'debug',
  }
];

module.exports = PROXY_CONFIG;
