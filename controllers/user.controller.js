const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user.model");
const { uploadImagesToAWS } = require("../helpers/photos.helper");
const { sendVerificationEmail } = require("../helpers/emails.helper");

const getUserByID = async (req, res) => {
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
};

const getUserByEmail = async (req, res) => {
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
};

const verifyUser = async (req, res) => {
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
};

const setUserInfo = async (req, res) => {
  try {
    let userFound = await User.findOne({ _id: req.params.userId });
    let userSameEmail = await User.findOne({ email: req.body.email });

    if (req.body.email && userSameEmail.email) {
      if (
        userFound.email === req.body.email &&
        userFound.userId !== userSameEmail.userId
      ) {
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
    if (userFound.isHost === true && userFound.isVerified !== true) {
      sendVerificationEmail(userFound.email, req.params.userId, userFound.name);
    }
    res.status(200).json({
      userFound,
    });
  } catch (e) {
    res.status(500).json({
      error: "There was an error updating your info.",
    });
  }
};

const setProfilePicture = async (req, res) => {
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
};

const sendFriendRequest = async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.user._id);
    const friendId = mongoose.Types.ObjectId(req.body.friendId);
    if (String(userId) === String(friendId)) {
      return res.status(400).json({
        error: `You can't send yourself a friend request`,
      });
    }

    let user = await User.findOne({ _id: userId });
    // Return error if repeated friend request
    for (let i = 0; i < user.outgoingFriendRequests.length; i++) {
      if (String(user.outgoingFriendRequests[i]) === String(friendId)) {
        return res.status(400).json({
          error: `You have already sent a friend request to ${friendId}`,
        });
      }
    }
    for (let i = 0; i < user.incomingFriendRequests.length; i++) {
      if (String(user.incomingFriendRequests[i]) === String(friendId)) {
        return res.status(400).json({
          error: `${friendId} has already sent you a friend request`,
        });
      }
    }

    // Return error if users are already friends
    for (let j = 0; j < user.friends.length; j++) {
      if (String(user.friends[j]) === String(friendId)) {
        return res.status(400).json({
          error: `You are already friends with ${friendId}`,
        });
      }
    }
    // Add friendId to user's outgoing friend requests
    user = await User.findOneAndUpdate(
      { _id: userId },
      { $push: { outgoingFriendRequests: friendId } }
    );
    // Add userId to friend's incoming friend requests
    const friend = await User.findOneAndUpdate(
      { _id: friendId },
      { $push: { incomingFriendRequests: userId } }
    );

    if (!user || !friend) {
      return res.status(500).json({
        error: "There was an error sending your friend request.",
      });
    }
    res.status(200).json({
      message: `Sent friend request to ${friendId}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "There was an error sending your friend request.",
    });
  }
};

const cancelFriendRequest = async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.user._id);
    const friendId = mongoose.Types.ObjectId(req.body.friendId);
    // Remove friendId from incoming/outgoing friend requests
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { outgoingFriendRequests: friendId } }
    );

    // Push no longer used as requests must be accepted before friends are added
    // user.friends.push = friendId;

    // Add userId to friend's friends array
    const friend = await User.findOneAndUpdate(
      { _id: friendId },
      { $pull: { incomingFriendRequests: userId } }
    );

    /* TODO: this doesn't really verify if friend request was or was not found
       Need to iterate through friend requests to verify that id's are not present */
    if (!user || !friend) {
      return res.status(404).json({
        error: "Friend request not found. Please try again.",
      });
    }
    res.status(200).json({
      message: `Cancelled friend request to ${friendId}`,
    });
  } catch (e) {
    res.status(500).json({
      error: "There was an error cancelling the friend request.",
    });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.user._id);
    const friendId = mongoose.Types.ObjectId(req.body.friendId);
    let user = await User.findOne({ _id: userId });
    // Return error if users are already friends
    for (let j = 0; j < user.friends.length; j++) {
      if (String(user.friends[j]) === String(friendId)) {
        return res.status(400).json({
          error: `You are already friends with ${friendId}`,
        });
      }
    }

    // Move friendId from incomingFriendRequests to friends
    user = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { incomingFriendRequests: friendId } }
    );
    user = await User.findOneAndUpdate(
      { _id: userId },
      { $push: { friends: friendId } }
    );
    // Move userId from outgoingFriendRequests to friends
    let friend = await User.findOneAndUpdate(
      { _id: friendId },
      { $pull: { outgoingFriendRequests: userId } }
    );
    friend = await User.findOneAndUpdate(
      { _id: friendId },
      { $push: { friends: userId } }
    );
    if (!user || !friend) {
      return res.status(404).json({
        error: "Friend request not found. Please try again.",
      });
    }
    res.status(200).json({
      message: `${friendId} added as a friend of ${userId}`,
    });
  } catch (e) {
    res.status(500).json({
      error: "There was an error accepting the friend request.",
    });
  }
};

const rejectFriendRequest = async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.user._id);
    const friendId = mongoose.Types.ObjectId(req.body.friendId);
    // Remove friendId from incoming/outgoing friend requests
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { incomingFriendRequests: friendId } }
    );
    const friend = await User.findOneAndUpdate(
      { _id: friendId },
      { $pull: { outgoingFriendRequests: userId } }
    );
    if (!user || !friend) {
      return res.status(404).json({
        error: "Friend request not found. Please try again.",
      });
    }
    res.status(200).json({
      message: `Rejected ${friendId}'s friend request`,
    });
  } catch (e) {
    res.status(500).json({
      error: "There was an error rejecting the friend request.",
    });
  }
};

const removeFriend = async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.user._id);
    const friendId = mongoose.Types.ObjectId(req.body.friendId);
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
};

module.exports = {
  getUserByID,
  getUserByEmail,
  verifyUser,
  setUserInfo,
  setProfilePicture,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
};
