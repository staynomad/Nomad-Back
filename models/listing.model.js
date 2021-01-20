const mongoose = require("mongoose");
const User = require("./user.model");
const Schema = mongoose.Schema;

const { Array, Mixed, Number, String, ObjectId } = Schema.Types;

const ListingSchema = new Schema({
  title: {
    type: String,
    default: null,
  },
  location: {
    type: Mixed,
    index: { unique: true },
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  details: {
    type: Mixed,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    default: null,
  },
  available: {
    type: Array,
    required: false,
  },
  pictures: {
    type: Array,
    default: null,
  },
  userId: {
    type: ObjectId,
    ref: User,
    required: false,
  },
  booked: {
    type: Array,
    default: [],
  },
  rating: {
    type: Object,
    default: null,
  },
  rules: {
    type: Array,
    default: null,
  },
  calendarURL: {
    type: String,
    default: null,
  },
  amenities: {
    type: Array,
    default: [],
  },
});

ListingSchema.set('timestamps', true);

const Listing = mongoose.model("listing", ListingSchema);
module.exports = Listing;
