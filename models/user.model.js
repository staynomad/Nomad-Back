const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { Boolean, String } = Schema.Types;

const UserSchema = new Schema({
<<<<<<< HEAD
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
  // Only required for hosts
  isVerified: {
    type: Boolean,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  profileImg: {
    type: String,
  },
=======
    name: {
        type: String,
        required: [true, 'Name cannot be blank'],
    },
    email: {
        type: String,
        index: { unique: true },
        required: [true, 'Email cannot be blank'],
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
        default: false
    },
    friends: {
        type: Array,
        default: []
    },
    // Only required for hosts
    isVerified: {
        type: Boolean,
    },
>>>>>>> 1c9d41948eeaf42ce3c98ab3fce98307b926d99e
});

const User = mongoose.model("user", UserSchema);
module.exports = User;
