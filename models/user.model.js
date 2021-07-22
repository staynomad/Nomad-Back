const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { Boolean, String } = Schema.Types;

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name cannot be blank"],
  },
  email: {
    type: String,
    index: { unique: true },
    required: [true, "Email cannot be blank"],
  },
  password: {
    type: String,
    required: true,
  },
  check: {
    type: String,
  },
  isHost: {
    type: Boolean,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  friends: {
    type: Array,
    default: [],
  },
  incomingFriendRequests: {
    type: Array,
    default: [],
  },
  outgoingFriendRequests: {
    type: Array,
    default: [],
  },
  profileImg: {
    type: String,
  },
  // Only required for hosts
  isVerified: {
    type: Boolean,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  stripeId: {
    type: String,
    default: null,
  },
});

const User = mongoose.model("user", UserSchema);
module.exports = User;
