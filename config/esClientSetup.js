const {
  esClient,
  createIndex,
  existsIndex,
  deleteIndex,
  getIndex,
  bulkIndex,
  insertDoc,
} = require('../elastic-search/esClient');
const {
  listingType,
  listingIndex,
} = require('../elastic-search/esClientconst');
const ListingModel = require('../models/listing.model');

const listingMap = {
  properties: {
    title: { type: 'text' },
    street: { type: 'text' },
    city: { type: 'text' },
    state: { type: 'text' },
    country: { type: 'text' },
    zipCode: { type: 'keyword' },
  },
};
const createListingIndex = async () => {
  const isExist = await existsIndex(listingIndex);
  try {
    if (!isExist) {
      index = await createIndex(listingIndex, listingType, listingMap);
      const listings = await ListingModel.find({ active: true });
      const data = listings.map((listing) => convertListing(l));
      await bulkIndex(listingIndex, listingType, data);
    } else {
      index = await getIndex(listingIndex);
    }
    return index;
  } catch (err) {
    console.log(err);
  }
};
createListingIndex();

module.exports = this;
