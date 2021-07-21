const nodemailer = require("nodemailer");
const { nodemailerPass } = require("../config/index");

const sendEmail = (userMailOptions) => {
  console.log("sending mail");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "staynomadhomes@gmail.com",
      pass: nodemailerPass,
    },
  });
  transporter.sendMail(userMailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email successfully sent to ${userMailerOptions.email}`);
    }
  });
};

module.exports = {
  sendEmail,
};
