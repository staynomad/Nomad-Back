const express = require("express");
const router = express.Router();

const User = require("../models/user.model");
const { requireUserAuth } = require("../utils");
const { multerUploads, uploadImagesToAWS } = require("./photos");

router.get("/getUserInfo/:userId", async (req, res) => {
  try {
    const userFound = await User.findOne({ _id: req.params.userId });
    if (!userFound) {
      return res.status(400).json({
        error: "User not found. Please try again.",
      });
    }
    if (userFound["description"]) {
      console.log("description identified: ", userFound.description);
      res.status(200).json({
        name: userFound.name,
        email: userFound.email,
        password: userFound.password,
        description: userFound.description,
      });
    } else {
      res.status(200).json(userFound);
    }
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
      if (userFound.email !== req.body.email) {
        return res.status(400).json({
          error: "Email already taken. Please try again.", // assure that it is not the same email
        });
      }
    }
    userFound = await User.findOneAndUpdate(
      { _id: req.params.userId },
      { $set: req.body },
      { strict: false }
    );
    res.status(200).json({
      name: userFound.name,
      email: userFound.email,
      description: userFound.description,
      isHost: userFound.isHost,
    });
  } catch (e) {
    console.log("there was an error in your post request...");
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

module.exports = router;
