const nodeMailer = require("nodemailer");

module.exports = async (email, subject, message) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      post: Number(process.env.PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: subject,
      text: message,
    });

    console.log("Email sent");
  } catch (error) {
    console.log(error);
    console.log("Email not sent");
  }
};
