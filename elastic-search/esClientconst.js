const listingIndex = 'listing';
const listingType = 'listing';
const convertListing = (listing) => {
  // convert a listing object to an object that could be index
  return {
    title: listing.title,
    street: listing.location.street,
    city: listing.location.city,
    state: listing.location.state,
    country: listing.location.country,
    zipCode: listing.location.zipcode,
  };
};

module.exports = { listingIndex, listingType, convertListing };
