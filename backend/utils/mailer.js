// utils/mailer.js
const nodemailer = require("nodemailer");

async function sendEmail(to, subject, html) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", result.messageId);
    return result;
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
}

module.exports = {
  sendEmail,
};
