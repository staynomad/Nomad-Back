const Housekeeping = require("../models/housekeeping.model");
const { sendEmail } = require("../helpers/nodemailer.helper");
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

const sendVerificationEmail = async (email, userId) => {
  const userMailOptions = {
    from: '"NomΛd" <reservations@visitnomad.com>',
    to: email,
    subject: `NomΛd email verification needed`,
    text: `Please click the following link to verify your account
         ${baseURL}/accountVerification/${email}`,
    html: `<p>
          Please click
          <a href="${baseURL}/accountVerification/${userId}">here</a>
          to verify your account
         </p>`,
  };
  sendEmail(userMailOptions);
};

module.exports = {
  incHousekeepingUsers,
  sendVerificationEmail,
};
