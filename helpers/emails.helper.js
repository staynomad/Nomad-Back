const { sendEmail, getHTML, getAttachments } = require("./nodemailer.helper");
const { baseURL } = require("../config/index");

const sendConfirmationEmail = (name, email, listingID) => {
  const HTMLOptions = {
    greeting: `Dear ${name},`,
    alert: "Thank you for listing on NomΛd!",
    action: "View your listing now!",
    description: `Your listing is live! Click the following link to view your listing page.
        <br />
        <a style="text-decoration:none;color:white;" href="${baseURL}/listing/${listingID}">
          ${baseURL}/listing/${listingID}
        </a>`,
    buttonText: "View Listing!",
    buttonURL: `${baseURL}/listing/${listingID}`,
  };

  const html = getHTML(HTMLOptions);
  const attachments = getAttachments();

  const userMailOptions = {
    from: '"Nomad" <reservations@visitnomad.com>',
    to: email,
    subject: `Thank you for listing on Nomad!`,
    html: html,
    attachments: attachments,
  };

  sendEmail(userMailOptions);
};

module.exports = {
  sendConfirmationEmail,
};
