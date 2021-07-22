const { sendEmail, getHTML, getAttachments } = require("./nodemailer.helper");
const { baseURL } = require("../config/index");

const sendReminder = async (name, email, listingName) => {
  const HTMLOptions = {
    greeting: `Dear ${name},`,
    alert: "YOUR LISTING IS EXPIRING SOON!",
    action: "Update your listing now!",
    description: `Please check your account, as your listing for
     <b style="color:white">${listingName}</b> expires next week.`,
    buttonText: "Take me There!",
    buttonURL: `${baseURL}/myAccount`,
  };
  const html = getHTML(HTMLOptions);
  const attachments = getAttachments();

  const userMailOptions = {
    from: '"NomΛd" <reservations@visitnomad.com>',
    to: email,
    subject: `Your Listing is Expiring Soon!`,
    html: html,
    attachments: attachments,
  };
  sendEmail(userMailOptions);
};

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
    subject: `Thank you for listing on NomΛd!`,
    html: html,
    attachments: attachments,
  };

  sendEmail(userMailOptions);
};

const sendTransferInvite = (receiveName, email, sentName) => {
  const HTMLOptions = {
    greeting: `Dear ${receiveName}`,
    alert: "You've Been Invited!",
    action: "Accept the Invite!",
    description: `
        ${sentName} has invited you to host their listing! To accept this invitation, please do the following:
            <br />
            1. Go to 
            <a style="text-decoration:none;color:white;" href="${baseURL}/MyAccount">${baseURL}/MyAccount</a>.
            If you do not yet have a NomΛd account, please sign up for a host account first.
            <br />
            2. Navigate to your profile and select "Transfer Requests" on the side menu. Here, you will see the listings you have been invited to host.
            <br />
            3. To accept all requests, simply click "Accept All." If you would like to accept an individual request, click "Accept" under the listing you want to accept.
            <br />
            4. You're all done! Click on "My Listings" in the side menu to view your new listing.
            <br />
        `,
    buttonText: "Take me There!",
    buttonURL: `${baseURL}/MyAccount`,
  };

  const html = getHTML(HTMLOptions);
  const attachments = getAttachments();

  const userMailOptions = {
    from: '"Nomad" <reservations@visitnomad.com>',
    to: email,
    subject: "You've Been Invited!",
    html: html,
    attachments: attachments,
  };

  sendEmail(userMailOptions);
};

const sendTransferEmailConfirmation = (
  sentUserName,
  mailTo,
  receiveUserName,
  listings
) => {
  const HTMLOptions = {
    greeting: `Dear ${sentUserName}`,
    alert: "Your Transfer was Successful!",
    action: "Your listings have been moved!",
    description: `${receiveUserName} has accepted your invitation! You will no longer have access to the following listing(s):
        <br />
        ${listings.join("<br />")}`,
    buttonText: "See your Listings",
    buttonURL: `${baseURL}/MyAccount`,
  };

  const html = getHTML(HTMLOptions);
  const attachments = getAttachments();

  const userMailOptions = {
    from: '"Nomad" <reservations@visitnomad.com>',
    to: mailTo,
    subject: `Your Transfer was Successful!`,
    html: html,
    attachments: attachments,
  };

  sendEmail(userMailOptions);
};

const sendTransferRejection = (
  sentUserName,
  mailTo,
  receiveUserName,
  listings
) => {
  const HTMLOptions = {
    greeting: `Dear ${sentUserName}`,
    alert: "Your Transfer Was Rejected",
    action: "Your listings have not been moved!",
    description: `${receiveUserName} has rejected your invitation. You will retain access to the following listing(s)::
        <br />
        ${listings.join("<br />")}`,
    buttonText: "See your Listings",
    buttonURL: `${baseURL}/MyAccount`,
  };

  const html = getHTML(HTMLOptions);
  const attachments = getAttachments();

  const userMailOptions = {
    from: '"Nomad" <reservations@visitnomad.com>',
    to: mailTo,
    subject: `Your Transfer was Rejected!`,
    html: html,
    attachments: attachments,
  };

  sendEmail(userMailOptions);
};

module.exports = {
  sendReminder,
  sendConfirmationEmail,
  sendTransferInvite,
  sendTransferEmailConfirmation,
  sendTransferRejection,
};
