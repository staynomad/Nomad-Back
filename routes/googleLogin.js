const express = require("express");
const User = require("../models/user.model");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const { getUserToken, passGenService } = require("../utils");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/", async (req, res) => {
  const { token } = req.body;
  // if user clicks out of google account selection popup
  if (!token) {
    return res.status(500).send("user clicked out of google account popup");
  }
  // verifies googleToken came from google auth servers
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  // searching for user in database
  console.log("searching");
  const searchQuery = { email: payload.email };
  let user = await User.findOne(searchQuery);
  if (!user) {
    // user not already in dataabse, creating new document for user
    console.log("creating document for user");
    const newUserData = {
      name: payload.name,
      email: payload.email,
      password: await passGenService(payload.sub),
      isHost: false, // as of right now there's no way to make a google user a host
    };
    user = new User(newUserData);
    await user.save();
  }
  console.log("creating user token");
  const userToken = getUserToken(user);
  return res.status(200).json({
    token: userToken,
    userId: user.id,
    isHost: user.isHost,
  });
});

module.exports = router;
