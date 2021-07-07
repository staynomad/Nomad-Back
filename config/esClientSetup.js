const {
  esClient,
  createIndex,
  existsIndex,
  deleteIndex,
  getIndex,
  bulkIndex,
  insertDoc,
  searchIndex,
} = require('../elastic-search/esClient');
const {
  listingType,
  listingIndex,
  convertListing,
} = require('../elastic-search/esClientconst');
const ListingModel = require('../models/listing.model');

const listingMap = {
  properties: {
    title: { type: 'text' },
    street: { type: 'text' },
    city: { type: 'text' },
    state: { type: 'text' },
    stateAbbrv: { type: 'text' },
    country: { type: 'text' },
    zipCode: { type: 'keyword' },
    listingID: { enabled: false },
  },
};
const createListingIndex = async () => {
  const isExist = await existsIndex(listingIndex);
  try {
    if (!isExist) {
      index = await createIndex(listingIndex, listingType, listingMap);
      const listings = await ListingModel.find({ active: true });
      const data = listings.map((listing) => convertListing(listing));
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
