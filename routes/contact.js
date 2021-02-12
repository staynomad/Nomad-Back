const express = require("express");
const router = express.Router();
const { body } = require('express-validator');
const nodemailer = require('nodemailer');

router.post(
  '/',
  body('email').isEmail(),
  async (req,res) => {
    try {
      const { name, email, subject, text } = req.body
      // Create nodemailer transport to send reservation confirmation emails
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'vhomesgroup@gmail.com',
          pass: 'yowguokryuzjmbhj'
        }
      })
      const ccto = [email, 'aiden@vhomesgroup.com']
      const userMailOptions = {
        from: `"${name}" <vhomesgroup@gmail.com>`,
        to: "contact@vhomesgroup.com",
        cc: ccto,
        subject: subject,
        text:
        `From: ${name}
         Email: ${email}

         ${text}`
      }
      transporter.sendMail(userMailOptions, (error, info) => {
        if (error) {
          console.log(error)
        }
        else {
          console.log(`Message sent to contact@vhomesgroup.com from ${email}`)
        }
      })
      res.status(200).json({
          "message": `Email sent to contact@vhomesgroup.com from ${email}`
      });
    }
    catch (error) {
      console.log(error);
      res.status(500).json({
        "errors":
          ["Error sending email. Please try again!"]
      });
    }
  }
)

module.exports = router
