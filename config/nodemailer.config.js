const nodeMailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

const newTransport = () => {
  if (process.env.NODE_ENV === "production") {
    // Sendgrid
    return nodeMailer.createTransport({
      service: "SendGrid",
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
  }

  return nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const send = async (options) => {
  // 1) Create a transporter
  const transporter = newTransport();

  // 2) Define the email options
  const mailOptions = {
    from: `Jonas Schmedtmann < ${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = send;
