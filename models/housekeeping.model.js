const { Document, model, Schema } = require("mongoose");

const HousekeepingSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  payload: {
    type: Array,
    required: true,
    default: [],
  },
});

const Housekeeping = model("housekeeping", HousekeepingSchema);
module.exports = Housekeeping;
