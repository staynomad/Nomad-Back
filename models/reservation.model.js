const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { Array, Number, ObjectId } = Schema.Types;

const ReservationSchema = new Schema(
  {
    user: {
      type: ObjectId,
      required: true,
    },
    listingId: {
      type: ObjectId,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: false,
    },
    checkedIn: {
      type: Boolean,
      required: true,
      default: false,
    },
    days: {
      type: Array,
      required: true,
    },
    guestFee: {
      type: Number,
      default: 0,
      required: true,
    },
    hostFee: {
      type: Number,
      default: 0,
      required: true,
    },
    totalPrice: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Reservation = mongoose.model("reservation", ReservationSchema);
module.exports = Reservation;
