const es = require('elasticsearch');

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

const createIndex = async (indexName, mappingType, mapping) => {
  const index = await esClient.indices.create({
    index: indexName,
  });
  await addMappingToIndex(indexName, mappingType, mapping);
  return index;
};

const existsIndex = async (indexName) => {
  return await esClient.indices.exists({ index: indexName });
};

const deleteIndex = async (indexName) => {
  await esClient.indices.delete({ index: indexName });
};

const getIndex = async (indexName) => {
  return await esClient.indices.get({ index: indexName });
};

const addMappingToIndex = async function (indexName, mappingType, mapping) {
  return await esClient.indices.putMapping({
    index: indexName,
    type: mappingType,
    body: mapping,
    includeTypeName: true,
  });
};

const bulkIndex = async (index, type, data) => {
  const bulkBody = [];

  data.forEach((item, i) => {
    bulkBody.push({
      index: {
        _index: index,
        _type: type,
      },
    });
    bulkBody.push(item);
  });
  esClient
    .bulk({ body: bulkBody })
    .then((response) => {
      let errorCount = 0;
      response.items.forEach((item) => {
        if (item.index && item.index.error) {
          console.log(++errorCount, item.index.error);
        }
      });
      console.log(
        `Successfully indexed ${data.length - errorCount}
       out of ${data.length} items`
      );
    })
    .catch(console.err);
};

const insertIndex = async function (indexName, type, data) {
  // indexName: string,
  // type: string,
  // data: object corresponding to the mapping
  return await esClient.index({
    index: indexName,
    type: type,
    body: data,
  });
};

const searchIndex = async function (indexName, type, payload) {
  // indexName: string
  // type: string
  // payload: instructions to search
  return await esClient.search({
    index: indexName,
    type: type,
    body: payload,
  });

  // {
  //   "query": {
  //     "match": {
  //       "name": {
  //         "query": "Vacuummm",
  //         "fuzziness": 2,
  //         "prefix_length": 1
  //       }
  //     }
  //   }
  // }

  //   {
  //     "query": {
  //         "multi_match" : {
  //             "query" : "heursitic reserch",
  //             "fields": ["phrase","position"],
  //             "fuzziness": 2
  //         }
  //     },
  //     "size": 10
  // }
};

module.exports = {
  createIndex,
  esClient,
  existsIndex,
  deleteIndex,
  getIndex,
  bulkIndex,
  insertIndex,
};
