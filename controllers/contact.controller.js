const nodemailer = require("nodemailer");
const { nodemailerPass } = require("../config/index");

const sendEmail = async (req, res) => {
  try {
    const { name, email, subject, text } = req.body;
    // Create nodemailer transport to send reservation confirmation emails
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "staynomadhomes@gmail.com",
        pass: nodemailerPass,
      },
    });
    const ccto = [email, "aiden@visitnomad.com"];
    const userMailOptions = {
      from: `"${name}" <staynomadhomes@gmail.com>`,
      to: "contact@visitnomad.com",
      cc: ccto,
      subject: subject,
      text: `From: ${name}
         Email: ${email}

         ${text}`,
    };
    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Message sent to contact@visitnomad.com from ${email}`);
      }
    });
    res.status(200).json({
      message: `Email sent to contact@visitnomad.com from ${email}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: ["Error sending email. Please try again!"],
    });
  }
};

module.exports = { sendEmail };
