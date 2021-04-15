const es = require('elasticsearch');

console.log('Running elastic search module');
const esClient = new es.Client({
  host: 'localhost:9200',
  log: 'error',
});

esClient.ping(
  {
    // ping usually has a 3000ms timeout
    requestTimeout: 1000,
  },
  function (error) {
    if (error) {
      console.trace('Elastic Search cluster is down!');
    } else {
      console.log('Elastic Search is running');
    }
  }
);

module.exports = esClient;
