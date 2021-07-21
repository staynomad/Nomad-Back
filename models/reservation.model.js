const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { Array, Mixed, Number, ObjectId, String, Date } = Schema.Types;

const ReservationSchema = new Schema(
  {
    user: {
      type: ObjectId,
      required: true,
    },
<<<<<<< HEAD
    listingId: {
=======
    listing: {
>>>>>>> c880b74e8c94feb5f4ced70eb7d46be68f6fe08b
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
