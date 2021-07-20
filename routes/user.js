const express = require("express");
const router = express.Router();

const User = require("../models/user.model");
const { requireUserAuth } = require("../utils");
const { multerUploads, uploadImagesToAWS } = require("./photos");

// Returns user object given a userId. If verbose = 1 is set, full friend objects are returned
router.get("/getUserInfo/:userId", async (req, res) => {
  try {
    const userFound = await User.findOne({ _id: req.params.userId });
    if (!userFound) {
      return res.status(400).json({
        error: "User not found. Please try again.",
      });
    }
    const verbose = req.query.verbose;
    if (verbose && verbose == 1) {
      let fullFriends = [];
      for (let i = 0; i < userFound.friends.length; i++) {
        const friend = await User.findOne({ _id: userFound.friends[i] });
        if (friend) fullFriends.push(friend);
      }
      return res.status(200).json({
        userFound,
        fullFriends,
      });
    }
    return res.status(200).json(userFound);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error getting user. Please try again.",
    });
  }
});

// Returns user object given an email. If verbose = 1 is set, full friend objects are returned
router.get("/getByEmail/:email", async (req, res) => {
  try {
    const userFound = await User.findOne({ email: req.params.email });
    if (!userFound) {
      return res.status(400).json({
        error: "User not found. Please try again.",
      });
    }
    const verbose = req.query.verbose;
    if (verbose && verbose == 1) {
      let fullFriends = [];
      for (let i = 0; i < userFound.friends.length; i++) {
        const friend = await User.findOne({ _id: userFound.friends[i] });
        if (friend) fullFriends.push(friend);
      }
      return res.status(200).json({
        userFound,
        fullFriends,
      });
    }
    return res.status(200).json(userFound);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error getting user. Please try again.",
    });
  }
});

// Updates isVerified to true and returns user information
router.post("/verify/:userId", async (req, res) => {
  try {
    const userFound = await User.findByIdAndUpdate(req.params.userId, {
      isVerified: true,
    });
    if (!userFound) {
      return res.status(400).json({
        error: "User not found. Please try again.",
      });
    }
    res.status(200).json({
      name: userFound.name,
      email: userFound.email,
      password: userFound.password,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error getting user. Please try again.",
    });
  }
  res.status(200).json({
    name: userFound.name,
    email: userFound.email,
    password: userFound.password,
  });
});

router.post("/setUserInfo/:userId", async (req, res) => {
  try {
    let userFound = await User.findOne({ _id: req.params.userId });

    if (req.body.email && User.findOne(req.body.email)) {
      if (userFound.email === req.body.email) {
        return res.status(400).json({
          error: "Email already taken. Please try again.", // assure that it is not the same email
        });
      }
    }
    userFound = await User.findOneAndUpdate(
      { _id: req.params.userId },
      { $set: req.body },
      { strict: false, new: true }
    );
    res.status(200).json({
      userFound,
    });
  } catch (e) {
    res.status(500).json({
      error: "There was an error updating your info.",
    });
  }
});

router.post(
  "/profileImage/:userId",
  multerUploads,
  requireUserAuth,
  async (req, res) => {
    try {
      const imageUploadRes = await uploadImagesToAWS(
        req.files["image"],
        "profileImg"
      );
      const imgUrl = imageUploadRes[0];

      const userToUpdate = await User.findOneAndUpdate(
        { _id: req.params.userId },
        { $set: { profileImg: imgUrl } },
        {
          new: true,
        }
      );

      res.status(201).json({ imgUrl: userToUpdate.profileImg });
    } catch (e) {
      console.log(e);
      res.status(500).json({
        error: "There was an error updating your info.",
      });
    }
  }
);

router.post("/addFriend", async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $push: { friends: friendId } }
    );
    const friend = await User.findOneAndUpdate(
      { _id: friendId },
      { $push: { friends: userId } }
    );
    if (!user || !friend) {
      return res.status(404).json({
        error: "User not found. Please try again.",
      });
    }
    res.status(200).json({
      message: `${friendId} added as a friend of ${userId}`,
    });
  } catch (e) {
    res.status(500).json({
      error: "There was an error adding a friend.",
    });
  }
});

router.delete("/removeFriend", async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    const user = await User.findOne({ _id: userId });
    const friend = await User.findOne({ _id: friendId });
    if (!user || !friend) {
      return res.status(404).json({
        error: "User does not exist.",
      });
    }
    const idx = user.friends.indexOf(friendId);
    const idx2 = friend.friends.indexOf(userId);
    if (idx !== -1 || idx2 !== -1) {
      // Remove friendId from user's friends
      let updatedFriends = user.friends;
      updatedFriends.splice(idx, 1);
      let updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { friends: updatedFriends }
      );
      // Remove userId from friend's users
      updatedFriends = friend.friends;
      updatedFriends.splice(idx, 1);
      updatedUser = await User.findOneAndUpdate(
        { _id: friendId },
        { friends: updatedFriends }
      );

      return res.status(200).json({
        message: `Successfully removed ${friendId} from ${userId}'s friends`,
      });
    }
    return res.status(404).json({
      message: `${friendId} and ${userId} are not friends`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Problem connecting with database. Please try again!",
    });
  }
});

module.exports = router;
