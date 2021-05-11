var https = require('https');

const healthCheck = () => {
  https.get('https://hc-ping.com/aa5812c2-7b3f-4572-b7cb-5c2ee53bc3fa').on('error', (err) => {
      console.log('Ping failed: ' + err)
  });
}

module.exports = healthCheck
