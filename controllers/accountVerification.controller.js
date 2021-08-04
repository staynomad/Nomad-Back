const { baseURL } = require("../config");
const { sendVerificationEmail } = require("../helpers/emails.helper");

const sendEmail = async (req, res) => {
  try {
    sendVerificationEmail(req.user.email, req.user._id, req.user.name);
    res.status(200).json({
      message: `Verified ${req.user._id}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: ["Error verifying account. Please try again!"],
    });
  }
};

module.exports = { sendEmail };
