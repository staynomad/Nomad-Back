const nodemailer = require("nodemailer");
const { nodemailerPass } = require("../config/index");
const { baseURL } = require("../config/index");

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

const getHTML = (HTMLOptions) => {
  HTMLOptions.greeting;
  HTMLOptions.alert;
  HTMLOptions.action;
  HTMLOptions.description;
  HTMLOptions.buttonText;
  return `<div>
      <div style=
          "background-color: #545454;
          border-radius: 10px 10px 0px 0px;
          font-family:'Open Sans',sans-serif;
          margin: auto;
          padding: 2rem;
          text-align: center;
          width: 40%;
          z-index: 9;"
      >
          <img src="cid:nomadlogo" style="width: 40%;" ></img>
          <div style=
              "color:white;
              font-size:14px;
              padding: 10px;"
          >
              ${HTMLOptions.greeting}
          </div>
          <div style=
              "color: #02b188;
              font-size:22px;
              font-weight: bold;
              padding: 10px;"
          >
              ${HTMLOptions.alert}
          </div>
          <div style=
              "color:white;
              font-size:30px;
              font-weight:bold;
              padding: 10px;"
          >
            ${HTMLOptions.action}
          </div>
          <div style=
              "color: #02b188;
              padding: 10px;"
          >
            ${HTMLOptions.description}
          </div>
          <button
              style=
              "background-color:#02b188;
              border:none;
              border-radius:0.5rem;
              box-shadow:0rem 0.2rem 0rem 0rem #0cc99d;
              color: white;
              display: block;
              margin: auto;
              padding: 15px 25px;"
          >
          <a 
              href="${baseURL}/myAccount"
              style=
              "color: white;
              text-decoration:none;
              text-align:center;"
          >
            ${HTMLOptions.buttonText}
          </a>
          </button>
      </div>
      <div style=
          "background-color: #02b188;
          border-radius: 0px 0px 10px 10px;
          font-family:'Open Sans',sans-serif;
          margin: auto;
          padding: 2rem;
          position:relative;
          text-align: center;
          width: 40%;"
      >
      <div style=
          "color: white;
          font-family: 'Open Sans', sans-serif;"
      >
          Visit us at 
          <a style=
          "color: white;
          font-family: 'Open Sans', sans-serif;
          text-decoration:none;
          " 
          href="${baseURL}/myAccount">${baseURL}/myAccount</a>
      </div>
      </div>
  </div>`;
};

module.exports = {
  sendEmail,
  getHTML,
};
