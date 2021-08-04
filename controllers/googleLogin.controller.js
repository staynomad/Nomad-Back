const User = require("../models/user.model");
const { OAuth2Client } = require("google-auth-library");
const { getUserToken, passGenService } = require("../utils");
const { incHousekeepingUsers } = require("../helpers/account.helper");
const { sendVerificationEmail } = require("../helpers/emails.helper");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const login = async (req, res) => {
  // isHost is undefined when call comes from login, otherwise has boolean value
  const { token, isHost } = req.body;
  // if user clicks out of google account selection popup
  if (!token) {
    return res.status(500).send("user clicked out of google account popup");
  }
  // verifies googleToken came from google auth servers
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // searching for user in database
    const searchQuery = { email: payload.email };
    let user = await User.findOne(searchQuery);
    if (!user) {
      // If user cannot be found and call came from login
      if (isHost === undefined) {
        return res.status(400).json({
          error: "Please sign up with Google first.",
        });
      }
      // user not already in dataabse, creating new document for user
      const newUserData = {
        name: payload.name,
        email: payload.email,
        password: await passGenService(payload.sub),
        isHost: isHost,
      };
      // Set isVerified to false only if user is a host
      if (isHost) {
        newUserData.isVerified = false;
      }
      user = await new User(newUserData).save();
      incHousekeepingUsers();
      if (isHost) {
        sendVerificationEmail(newUserData.email, user._id);
      }
    }
    const userToken = getUserToken(user);
    return res.status(200).json({
      token: userToken,
      userId: user.id,
      isHost: user.isHost,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Google client ID is invalid",
    });
  }
};
module.exports = { login };
