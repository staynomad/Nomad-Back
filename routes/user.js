const express = require("express");
const router = express.Router();

const User = require("../models/user.model");
const { requireUserAuth } = require("../utils");

router.get('/getUserInfo/:userId', async (req, res) => {
  try {
    const userFound = await User.findOne({ _id: req.params.userId });
    if (!userFound) {
      return res.status(400).json({
        error: 'User not found. Please try again.',
      });
    }
    if (userFound['description']) {
      console.log('description identified: ', userFound.description);
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
      error: 'Error getting user. Please try again.',
    });
  }
});

// Updates isVerified to true and returns user information
router.post(
  '/verify/:userId',
  async (req, res) => {
    try {
      const userFound = await User.findByIdAndUpdate(req.params.userId, { isVerified: true })
      if (!userFound) {
        return res.status(400).json({
          error: 'User not found. Please try again.',
        });
      }
      res.status(200).json({
        name: userFound.name,
        email: userFound.email,
        password: userFound.password
      });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({
        error: 'Error getting user. Please try again.',
      });
    }
  }
)

router.post('/setUserInfo/:userId', async (req, res) => {
  try {
    let userFound = await User.findOne(
      { _id: req.params.userId }
    )

    if (req.body.email && User.findOne(req.body.email)) {
      if (userFound.email !== req.body.email) {
        return res.status(400).json({
          error: 'Email already taken. Please try again.', // assure that it is not the same email
        });
      }
    }
    userFound =
      await User.findOneAndUpdate(
        { _id: req.params.userId },
        { $set: req.body },
        { strict: false }
      );
    res.status(200).json({
      name: userFound.name,
      email: userFound.email,
      description: userFound.description
    });
  } catch (e) {
    console.log('there was an error in your post request...');
    res.status(500).json({
      error: 'There was an error updating your info.',
    });
  }
});

router.put('/sendCoHostReq', requireUserAuth, async (req, res) => {
  try {
    const { email } = req.data;

    const updateCoHostReq = {
      $push: { coHostReq: req.user._id },
    };
    const userToSendReqTo = await User.findOneAndUpdate(
      { email: email },
      updateCoHostReq
    );

    if (!userToSendReqTo) return res.status(404).json({
      error: "User does not exist. Please try again.",
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({
      error: 'There was an error sending the request.',
    });
  }
});

router.put('/acceptCoHostReq', requireUserAuth, async (req, res) => {
  try {
    const { coHostReqSenderId } = req.data;

    // Remove request and add sender to coHost
    const updateCoHostReq = {
      $pull: { coHostReq: coHostReqSenderId },
      $push: { coHost: coHostReqSenderId }
    };

    // Add coHost to sender arr
    const updateCoHostSender = {
      $push: { coHost: req.user._id },
    };

    // Remove coHostReq from user receiving the request and add coHost
    const userReceivingReq = await User.findOneAndUpdate(
      { email: req.user.email },
      updateCoHostReq
    );

    // Add user accepting to the coHost array of the other person
    const userSendingReq = await User.findOneAndUpdate(
      { _id: coHostReqSenderId },
      updateCoHostSender
    );

    if (!userReceivingReq || !userSendingReq) return res.status(404).json({
      error: "User does not exist. Please try again.",
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({
      error: 'There was an error sending the request.',
    });
  }
});

module.exports = router