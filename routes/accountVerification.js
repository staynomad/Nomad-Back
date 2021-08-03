const express = require("express");
const router = express.Router();
const { requireUserAuth } = require("../utils");
const { sendVerificationEmail } = require("../helpers/emails.helper");

router.post("/sendVerificationEmail", requireUserAuth, async (req, res) => {
  try {
    console.log(req);
    sendVerificationEmail("S", "stanxy357@gmail.com", 12345);
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
