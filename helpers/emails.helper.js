const { sendEmail, getHTML, getAttachments } = require("./nodemailer.helper");
const { baseURL } = require("../config/index");

const sendExpirationReminder = async (name, email, listingName) => {
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

const sendVerificationEmail = async (email, userId, name = null) => {
  if (name == null) {
    setGreeting = "Welcome!";
  } else {
    setGreeting = `Welcome, ${name}!`;
  }

  const HTMLOptions = {
    greeting: setGreeting,
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

const sendTransferAccept = (
  sentUserName,
  sentMailTo,
  receiveUserName,
  receiveMailTo,
  listings
) => {
  let HTMLOptions = {
    greeting: `Dear ${sentUserName}`,
    alert: "Your Transfer was Successful!",
    action: "Your listings have been moved!",
    description: `${receiveUserName} has accepted your invitation! You will no longer have access to the following listing(s):
        <br />
        ${listings.join("<br />")}`,
    buttonText: "See your Listings",
    buttonURL: `${baseURL}/MyAccount`,
  };

  let html = getHTML(HTMLOptions);
  const attachments = getAttachments();

  let userMailOptions = {
    from: '"Nomad" <reservations@visitnomad.com>',
    to: sentMailTo,
    subject: `Your Transfer was Successful!`,
    html: html,
    attachments: attachments,
  };

  sendEmail(userMailOptions);

  HTMLOptions = {
    greeting: `Dear ${receiveUserName}`,
    alert: "Transfer Request Accepted!",
    action: "Your have new listings!",
    description: `You have accepted ${sentUserName}'s transfer invitation! You will now have access to the following listing(s):
        <br />
        ${listings.join("<br />")}`,
    buttonText: "See your Listings",
    buttonURL: `${baseURL}/MyAccount`,
  };

  html = getHTML(HTMLOptions);

  userMailOptions = {
    from: '"Nomad" <reservations@visitnomad.com>',
    to: receiveMailTo,
    subject: `Transfer Request Accepted!`,
    html: html,
    attachments: attachments,
  };

  sendEmail(userMailOptions);
};

const sendTransferRejection = (
  sentUserName,
  sentMailTo,
  receiveUserName,
  receiveMailTo,
  listings
) => {
  let HTMLOptions = {
    greeting: `Dear ${sentUserName}`,
    alert: "Your Transfer Was Rejected!",
    action: "Your listings have not been moved!",
    description: `${receiveUserName} has rejected your invitation. You will retain access to the following listing(s):
        <br />
        ${listings.join("<br />")}`,
    buttonText: "See your Listings",
    buttonURL: `${baseURL}/MyAccount`,
  };

  let html = getHTML(HTMLOptions);
  const attachments = getAttachments();

  let userMailOptions = {
    from: '"Nomad" <reservations@visitnomad.com>',
    to: sentMailTo,
    subject: `Your Transfer was Rejected!`,
    html: html,
    attachments: attachments,
  };

  sendEmail(userMailOptions);

  HTMLOptions = {
    greeting: `Dear ${receiveUserName}`,
    alert: "Transfer Request Rejected!",
    action: "Your listings have not changed!",
    description: `You have rejected ${sentUserName}'s transfer invitation! You will not have access to the following listing(s):
        <br />
        ${listings.join("<br />")}`,
    buttonText: "See your Listings",
    buttonURL: `${baseURL}/MyAccount`,
  };

  html = getHTML(HTMLOptions);

  userMailOptions = {
    from: '"Nomad" <reservations@visitnomad.com>',
    to: receiveMailTo,
    subject: `Transfer Request Rejected!`,
    html: html,
    attachments: attachments,
  };

  sendEmail(userMailOptions);
};

const sendReservationConfirmationGuest = (
  guestInfo,
  hostInfo,
  bookedListing,
  reservationInfo
) => {
  const HTMLOptions = {
    greeting: `Dear ${guestInfo.name}`,
    alert: `Your Reservation has been Confirmed: ${bookedListing.title}`,
    action: "Review your Details!",
    description: `Thank you for booking with NomΛd! Here's your reservation information:
    <br />
    ${bookedListing.title}
    <br />
    Reservation number: ${reservationInfo._id}
    <br />
    Address: ${bookedListing.location.street}, ${bookedListing.location.city}, ${bookedListing.location.state}, ${bookedListing.location.zipcode}
    <br />
    Total cost: $${reservationInfo.totalPrice}
    <br />
    Days: ${reservationInfo.days[0]} to ${reservationInfo.days[1]}
    <br />
    Host name: ${hostInfo.name}
    <br />
    When you arrive at the property, make sure to checkin via the NomΛd website in order to alert the host that you have arrived. If you have any 
    questions or concerns, please reach out to the host at 
    <a style="text-decoration:none;color:white;" href="${hostInfo.email}">
    ${hostInfo.email}
    </a>. To cancel your reservation, please contact us at 
    <a style="text-decoration:none;color:white;" href="contact@visitnomad.com">
    contact@visitnomad.com
    </a>. 
    Hope you enjoy your stay!`,
    buttonText: "See your Reservations",
    buttonURL: `${baseURL}/MyAccount`,
  };

  const html = getHTML(HTMLOptions);
  const attachments = getAttachments();

  const userMailOptions = {
    from: '"Nomad" <reservations@visitnomad.com>',
    to: guestInfo.email,
    subject: `Your Reservation has been Confirmed: ${bookedListing.title}`,
    html: html,
    attachments: attachments,
  };

  sendEmail(userMailOptions);
};

const sendReservationConfirmationHost = (
  hostInfo,
  guestInfo,
  bookedListing,
  reservationInfo
) => {
  const HTMLOptions = {
    greeting: `Dear ${hostInfo.name}`,
    alert: `Your listing has been booked: ${bookedListing.title}`,
    action: "Review your Details!",
    description: `Thank you for listing on NomΛd! Here's the information regarding your listing reservation:
    <br />
    ${bookedListing.title}
    <br />
    Reservation number: ${reservationInfo._id}
    <br />
    Address: ${bookedListing.location.street}, ${
      bookedListing.location.city
    }, ${bookedListing.location.state}, ${bookedListing.location.zipcode}
    <br />
    Total Payout: $${reservationInfo.totalPrice - reservationInfo.hostFee}
    <br />
    Days: ${reservationInfo.days[0]} to ${reservationInfo.days[1]}
    <br />
    Guest name: ${guestInfo.name}
    <br />
    We'll send you another email once the guest has checked in. If you have any questions or concerns, please reach out to the guest at 
    <a style="text-decoration:none;color:white;" href="${guestInfo.email}">
    ${guestInfo.email}
    </a>. 
    To cancel this reservation, please contact us at 
    <a style="text-decoration:none;color:white;" href="contact@visitnomad.com">
    contact@visitnomad.com
    </a>. Thank you for choosing NomΛd!`,
    buttonText: "See your Listings",
    buttonURL: `${baseURL}/MyAccount`,
  };

  const html = getHTML(HTMLOptions);
  const attachments = getAttachments();

  const userMailOptions = {
    from: '"Nomad" <reservations@visitnomad.com>',
    to: hostInfo.email,
    subject: `Your listing has been booked: ${bookedListing.title}`,
    html: html,
    attachments: attachments,
  };

  sendEmail(userMailOptions);
};

const sendCheckinGuest = (
  guestInfo,
  hostInfo,
  bookedListing,
  reservationInfo
) => {
  const HTMLOptions = {
    greeting: `Dear ${guestInfo.name}`,
    alert: `Thanks for checking in to ${bookedListing.title}!`,
    action: "Review your Details!",
    description: `You have successfully checked in to your stay! The host has been notified and will let you in soon. If you have any questions or concerns, 
    please reach out to the host at 
    <a style="text-decoration:none;color:white;" href="${hostInfo.email}">
    ${hostInfo.email}
    </a>.
    <br />
    ${bookedListing.title}
    <br />
    Reservation number: ${reservationInfo._id}
    <br />
    Address: ${bookedListing.location.street}, ${bookedListing.location.city}, ${bookedListing.location.state}, ${bookedListing.location.zipcode}
    <br />
    Days: ${reservationInfo.days[0]} to ${reservationInfo.days[1]}
    <br />
    Host name: ${hostInfo.name}
    <br />
    Hope you enjoy your stay!`,
    buttonText: "View Your Account",
    buttonURL: `${baseURL}/MyAccount`,
  };

  const html = getHTML(HTMLOptions);
  const attachments = getAttachments();

  const userMailOptions = {
    from: '"Nomad" <reservations@visitnomad.com>',
    to: guestInfo.email,
    subject: `Thanks for checking in to ${bookedListing.title}!`,
    html: html,
    attachments: attachments,
  };

  sendEmail(userMailOptions);
};

const sendCheckinHost = (
  hostInfo,
  guestInfo,
  bookedListing,
  reservationInfo
) => {
  const HTMLOptions = {
    greeting: `Dear ${hostInfo.name}`,
    alert: `${guestInfo.name} has checked in to ${bookedListing.title}!`,
    action: "Review your Details!",
    description: `Your guest has just checked in! Please provide them with the next steps to begin their stay. 
    If you have any questions or concerns, please reach out to the guest at 
    <a style="text-decoration:none;color:white;" href="${guestInfo.email}">
    ${guestInfo.email}
    </a>.
    <br />
    ${bookedListing.title}
    <br />
    Address: ${bookedListing.location.street}, ${bookedListing.location.city}, ${bookedListing.location.state}, ${bookedListing.location.zipcode}
    <br />
    Days: ${reservationInfo.days[0]} to ${reservationInfo.days[1]}
    <br />
    Guest name: ${guestInfo.name}
    <br />
    Thank you for choosing NomΛd!`,
    buttonText: "View Your Listings",
    buttonURL: `${baseURL}/MyAccount`,
  };

  const html = getHTML(HTMLOptions);
  const attachments = getAttachments();

  const userMailOptions = {
    from: '"Nomad" <reservations@visitnomad.com>',
    to: hostInfo.email,
    subject: `${guestInfo.name} has checked in to ${bookedListing.title}!`,
    html: html,
    attachments: attachments,
  };

  sendEmail(userMailOptions);
};

const sendCheckoutGuest = (
  guestInfo,
  hostInfo,
  bookedListing,
  reservationInfo
) => {
  const HTMLOptions = {
    greeting: `Dear ${guestInfo.name}`,
    alert: `Thanks for checking out from ${bookedListing.title}!`,
    action: "Review your Details!",
    description: `You have successfully checked out from your stay! If you have any questions or concerns, please reach out to the host at 
    <a style="text-decoration:none;color:white;" href="${hostInfo.email}">
    ${hostInfo.email}
    </a>.
    <br />
    ${bookedListing.title}
    <br />
    Reservation number: ${reservationInfo._id}
    <br />
    Address: ${bookedListing.location.street}, ${bookedListing.location.city}, ${bookedListing.location.state}, ${bookedListing.location.zipcode}
    <br />
    Days: ${reservationInfo.days[0]} to ${reservationInfo.days[1]}
    <br />
    Host name: ${hostInfo.name}
    <br />
    Hope you enjoyed your stay!`,
    buttonText: "View Your Account",
    buttonURL: `${baseURL}/MyAccount`,
  };

  const html = getHTML(HTMLOptions);
  const attachments = getAttachments();

  const userMailOptions = {
    from: '"Nomad" <reservations@visitnomad.com>',
    to: guestInfo.email,
    subject: `Thanks for checking out from ${bookedListing.title}!`,
    html: html,
    attachments: attachments,
  };

  sendEmail(userMailOptions);
};

const sendCheckoutHost = (
  hostInfo,
  guestInfo,
  bookedListing,
  reservationInfo
) => {
  const HTMLOptions = {
    greeting: `Dear ${hostInfo.name}`,
    alert: `${guestInfo.name} has checked out from ${bookedListing.title}!`,
    action: "Review your Details!",
    description: `Your guest has just checked out! If you have any questions or concerns, please reach out to the guest at 
    <a style="text-decoration:none;color:white;" href="${guestInfo.email}">
    ${guestInfo.email}
    </a>.
    <br />
    ${bookedListing.title}
    <br />
    Address: ${bookedListing.location.street}, ${bookedListing.location.city}, ${bookedListing.location.state}, ${bookedListing.location.zipcode}
    <br />
    Days: ${reservationInfo.days[0]} to ${reservationInfo.days[1]}
    <br />
    Guest name: ${guestInfo.name}
    <br />
    Thank you for choosing NomΛd!`,
    buttonText: "View Your Listings",
    buttonURL: `${baseURL}/MyAccount`,
  };

  const html = getHTML(HTMLOptions);
  const attachments = getAttachments();

  const userMailOptions = {
    from: '"Nomad" <reservations@visitnomad.com>',
    to: hostInfo.email,
    subject: `${guestInfo.name} has checked out from ${bookedListing.title}!`,
    html: html,
    attachments: attachments,
  };

  sendEmail(userMailOptions);
};

module.exports = {
  sendExpirationReminder,
  sendVerificationEmail,
  sendConfirmationEmail,
  sendTransferInvite,
  sendTransferAccept,
  sendTransferRejection,
  sendReservationConfirmationGuest,
  sendReservationConfirmationHost,
  sendCheckinGuest,
  sendCheckinHost,
  sendCheckoutGuest,
  sendCheckoutHost,
};
