const mongoose = require("mongoose");
const Schema = mongoose.Schema;

refreshTokenSchema = new Schema(
  {
    refreshToken: {
      type: String,
      required: [true, "Refresh token cannot be blank"],
    },
  },
  { timestamps: true }
);

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

module.exports = RefreshToken;
