const { baseURL } = require("../config");
const express = require("express");
const router = express.Router();
const { requireUserAuth } = require("../utils");
const { sendVerificationEmail } = require("../helpers/account.helper");

router.post("/sendVerificationEmail", requireUserAuth, async (req, res) => {
  try {
    sendVerificationEmail(req.body.email, req.user._id);
    res.status(200).json({
      message: `Verified ${req.user._id}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: ["Error verifying account. Please try again!"],
    });
  }
});

module.exports = router;
