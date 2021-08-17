/* BASE PATH: /user */

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

/*
INPUT:
  userId (params) - ID corresponding to requested user
DESCRIPTION:
  gets user object given a userId - if verbose = 1 is set, full friend objects are returned
*/
router.get("/getUserInfo/:userId", getUserByID);

/*
INPUT:
  email (params) - string email corresponding to requested user
DESCRIPTION:
  gets user object given an email - if verbose = 1 is set, full friend objects are returned
*/
router.get("/getByEmail/:email", getUserByEmail);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  userId (params) - ID corresponding to requested user
DESCRIPTION:
  updates isVerified to true and returns user information
*/
router.post("/verify/:userId", requireUserAuth, verifyUser);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  userId (params) - ID corresponding to requested user
  any field in user model (body) - body data that matches user model fields will update corresponding field in requested user
DESCRIPTION:
  updates user object in database with provied user data
*/
router.post("/setUserInfo/:userId", requireUserAuth, setUserInfo);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  userId (params) - ID corresponding to requested user
  file (file) - image file being uploaded as profile picture
DESCRIPTION:
  uploads profile picture and sets url for specified user
*/
router.post(
  "/profileImage/:userId",
  multerUploads,
  requireUserAuth,
  setProfilePicture
);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  friendId (body) - ID of user receiving the friend request
DESCRIPTION:
  sends friend request from logged in user to friendId's user
*/
router.post("/sendFriendRequest", requireUserAuth, sendFriendRequest);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  friendId (body) - ID of user in the friend request to be cancelled
DESCRIPTION:
  cancels friend request from logged in user to friendId's user
*/
router.post("/cancelFriendRequest", requireUserAuth, cancelFriendRequest);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  friendId (body) - ID of user who sent friend request
DESCRIPTION:
  accepts friend request from logged in user to friendId's user
*/
router.post("/acceptFriendRequest", requireUserAuth, acceptFriendRequest);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  friendId (body) - ID of user who sent friend request
DESCRIPTION:
  rejects friend request from logged in user to friendId's user
*/
router.post("/rejectFriendRequest", requireUserAuth, rejectFriendRequest);

/*
INPUT:
  user (requireUserAuth) - object automatically sent by passing in bearer token
  friendId (body) - ID of user to be removed from friends
DESCRIPTION:
  removes userId from friends array
*/
router.delete("/removeFriend", requireUserAuth, removeFriend);

module.exports = router;
