/* BASE PATH: /adminVerify */

const express = require("express");
const router = express.Router();
const AdminVerification = require("../controllers/adminVerification.controller.js");

/*
INPUT:
  password (body) - string password for admin verification page indicated in .env
DESCRIPTION:
  verifies admin password (used in staging environment and admin dashboard)
*/
router.post("/", AdminVerification.verify);

/*
INPUT:
  Bearer <token> ('Authorization' header) - string access token that is passed by default from admin dashboard. 
  <refreshToken> - ('RefreshToken' header) string refresh token that is passed by default from admin dashboard.
DESCRIPTION:
  Verifies the access token and refreshes the token if it's expired (used in admin dashboard to keep user in session) 
*/
router.post("/verifyToken", AdminVerification.verifyToken);

/*
INPUT:
  <refreshToken> - ('RefreshToken' header) string refresh token that is passed by default from admin dashboard.
DESCRIPTION:
  Removes refresh token from MongoDB to prevent user from continuing their logged in session on admin dashboard.
*/
router.post("/logout", AdminVerification.deleteRefreshToken);

module.exports = router;
