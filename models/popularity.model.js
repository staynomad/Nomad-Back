const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { Array, Mixed, Number, String, ObjectId } = Schema.Types;

const PopularitySchema = new Schema({
  listingId: {
    type: ObjectId,
    ref: "Listing",
    required: true,
    unique: true,
  },
  visitCount: {
    type: Number,
    default: 0,
  },
  visits: {
    type: Array,
    default: [0, 0, 0, 0, 0, 0, 0],
  },
  last_visited: {
    type: Date,
    default: null,
  },
});

const popularity = mongoose.model("popularity", PopularitySchema);
module.exports = popularity;
