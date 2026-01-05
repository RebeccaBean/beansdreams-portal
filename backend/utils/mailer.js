// utils/mailer.js
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

// Configure OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" // redirect URI
);

// Set refresh token
oAuth2Client.setCredentials({
  refresh_token: process.env.OAUTH_REFRESH_TOKEN,
});

/**
 * Generic sendEmail function using Gmail OAuth2
 */
async function sendEmail(to, subject, html) {
  try {
    // Get a fresh access token
    const accessTokenObject = await oAuth2Client.getAccessToken();
    const accessToken =
      typeof accessTokenObject === "string"
        ? accessTokenObject
        : accessTokenObject?.token;

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        accessToken,
      },
    });

    // Send email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
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

