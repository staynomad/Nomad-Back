const express = require("express");
const router = express.Router();
const { requireUserAuth } = require("../utils");
const { multerUploads } = require("../helpers/photos.helper");
const {
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
} = require("../controllers/user.controller");

// Returns user object given a userId. If verbose = 1 is set, full friend objects are returned
router.get("/getUserInfo/:userId", getUserByID);

// Returns user object given an email. If verbose = 1 is set, full friend objects are returned
router.get("/getByEmail/:email", getUserByEmail);

// Updates isVerified to true and returns user information
router.post("/verify/:userId", requireUserAuth, verifyUser);

router.post("/setUserInfo/:userId", requireUserAuth, setUserInfo);

router.post(
  "/profileImage/:userId",
  multerUploads,
  requireUserAuth,
  setProfilePicture
);

// Sends friend request
router.post("/sendFriendRequest", requireUserAuth, sendFriendRequest);

// Cancels friend request
router.post("/cancelFriendRequest", requireUserAuth, cancelFriendRequest);

// Accepts friend request
router.post("/acceptFriendRequest", requireUserAuth, acceptFriendRequest);

// Rejects friend request
router.post("/rejectFriendRequest", requireUserAuth, rejectFriendRequest);

// Removes userId from friends array
router.delete("/removeFriend", requireUserAuth, removeFriend);

module.exports = router;
