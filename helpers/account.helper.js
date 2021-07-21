const Housekeeping = require("../models/housekeeping.model");
const {
  sendEmail,
  getHTML,
  getAttachments,
} = require("../helpers/nodemailer.helper");
const { baseURL } = require("../config/index");

// Increment users property in housekeeping collection
const incHousekeepingUsers = async () => {
  const curr = new Date();
  const field = curr.getMonth() + 1 + "/" + curr.getDate();
  await Housekeeping.findOneAndUpdate(
    { name: "users" },
    { $inc: { ["payload." + field]: 1 } }
  );
};

const sendVerificationEmail = async (name, email, userId) => {
  const HTMLOptions = {
    greeting: `Welcome, ${name}!`,
    alert: "We're excited to have you!",
    action: "Activate your account now",
    description: `Click the button below or go to the following link to verify your acccount: 
    <br /> 
    <a style="text-decoration:none;color:white;" href="${baseURL}/accountVerification/${userId}">
      ${baseURL}/accountVerification/${userId}
    </a>`,
    buttonText: "Activate Account",
    buttonURL: `${baseURL}/accountVerification/${userId}`,
  };
  const html = getHTML(HTMLOptions);
  const attachments = getAttachments();

  const userMailOptions = {
    from: '"NomΛd" <reservations@visitnomad.com>',
    to: email,
    subject: `Verify your NomΛd Account`,
    html: html,
    attachments: attachments,
  };
  sendEmail(userMailOptions);
};

module.exports = {
  incHousekeepingUsers,
  sendVerificationEmail,
};
