// utils/emailTemplates.js

// Welcome Email Template
function welcomeEmail({ brand, firstName, email, role, dashboardUrl, supportEmail, logoUrl, websiteUrl }) {
  const year = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8" /><title>Welcome to ${brand}</title></head>
  <body style="margin:0;padding:0;background:#FFF5EA;font-family:Arial,sans-serif;color:#111827;">
    <table style="max-width:640px;margin:0 auto;background:#fff;">
      <tr>
        <td style="padding:24px;text-align:center;background:#004AAA;color:#fff;">
          <img src="${logoUrl}" alt="${brand} logo" style="max-width:160px;margin-bottom:8px;" />
          <div style="font-size:18px;font-weight:600;">Welcome to ${brand}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h1 style="margin:0 0 12px;font-size:24px;color:#FF940E;">Hi ${firstName}, we're glad you're here.</h1>
          <p>Thanks for signing up for ${brand}. Your account is ready, and you can start exploring classes, bundles, and the student portal right away.</p>
          <div style="background:#FFEBD2;border-radius:12px;padding:20px;margin:16px 0;">
            <p><strong>Account email:</strong> ${email}</p>
            <p><strong>Role:</strong> ${role}</p>
          </div>
          <p><a href="${dashboardUrl}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#FEB803;color:#fff;text-decoration:none;font-weight:600;">Go to your dashboard</a></p>
          <p style="font-size:14px;color:#6b7280;">Need support? Contact us at <a href="mailto:${supportEmail}" style="color:#004AAA;">${supportEmail}</a>.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;text-align:center;font-size:13px;color:#8b6d0c;">
          © ${year} ${brand} · <a href="${websiteUrl}" style="color:#004AAA;text-decoration:none;">${websiteUrl}</a>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

// Purchase Confirmation Email Template
function purchaseEmail({ brand, firstName, orderId, transactionId, orderDate, currency, total, items, dashboardUrl, supportEmail, logoUrl, websiteUrl }) {
  const year = new Date().getFullYear();
  const itemsHtml = items.map(item => `<li>${item.name} — ${currency} ${item.price.toFixed(2)}</li>`).join('');
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8" /><title>Your ${brand} order confirmation</title></head>
  <body style="margin:0;padding:0;background:#FFF5EA;font-family:Arial,sans-serif;color:#111827;">
    <table style="max-width:640px;margin:0 auto;background:#fff;">
      <tr>
        <td style="padding:24px;text-align:center;background:#004AAA;color:#fff;">
          <img src="${logoUrl}" alt="${brand} logo" style="max-width:160px;margin-bottom:8px;" />
          <div style="font-size:18px;font-weight:600;">Order confirmation</div>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h1 style="margin:0 0 12px;font-size:22px;color:#FD8100;">Thanks for your purchase, ${firstName}!</h1>
          <p style="color:#FF940E;font-weight:600;">Payment confirmed. Your access has been added to your ${brand} account.</p>
          <div style="background:#FFE0B3;border-radius:12px;padding:20px;margin:16px 0;">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Transaction:</strong> ${transactionId}</p>
            <p><strong>Date:</strong> ${orderDate}</p>
            <p><strong>Total:</strong> ${currency} ${total.toFixed(2)}</p>
          </div>
          <p><strong>Items:</strong></p>
          <ul style="margin:12px 0 4px;padding-left:20px;">${itemsHtml}</ul>
          <p><a href="${dashboardUrl}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#FEB803;color:#fff;text-decoration:none;font-weight:600;">Open your dashboard</a></p>
          <p style="font-size:14px;color:#6b7280;">Questions? Contact <a href="mailto:${supportEmail}" style="color:#004AAA;">${supportEmail}</a>.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;text-align:center;font-size:13px;color:#8b6d0c;">
          © ${year} ${brand} · <a href="${websiteUrl}" style="color:#004AAA;text-decoration:none;">${websiteUrl}</a>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

// Password Reset Email Template
function resetPasswordEmail({ brand, firstName, resetLink, supportEmail, logoUrl, websiteUrl }) {
  const year = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8" /><title>Reset your ${brand} password</title></head>
  <body style="margin:0;padding:0;background:#FFF5EA;font-family:Arial,sans-serif;color:#111827;">
    <table style="max-width:640px;margin:0 auto;background:#fff;">
      <tr><td style="padding:24px;text-align:center;background:#004AAA;color:#fff;">
        <img src="${logoUrl}" alt="${brand} logo" style="max-width:160px;margin-bottom:8px;" />
        <div style="font-size:18px;font-weight:600;">Password Reset</div>
      </td></tr>
      <tr><td style="padding:32px;">
        <h1 style="color:#FD8100;">Hi ${firstName},</h1>
        <p>We received a request to reset your ${brand} account password.</p>
        <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
        <p><a href="${resetLink}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#FEB803;color:#fff;text-decoration:none;font-weight:600;">Reset Password</a></p>
        <p style="font-size:14px;color:#6b7280;">If you didn’t request this, you can safely ignore this email.</p>
        <p style="font-size:14px;color:#6b7280;">Need help? Contact <a href="mailto:${supportEmail}" style="color:#004AAA;">${supportEmail}</a>.</p>
      </td></tr>
      <tr><td style="padding:24px;text-align:center;font-size:13px;color:#8b6d0c;">
        © ${year} ${brand} · <a href="${websiteUrl}" style="color:#004AAA;text-decoration:none;">${websiteUrl}</a>
      </td></tr>
    </table>
  </body>
  </html>`;
}

// Subscription Renewal Reminder Email Template
function subscriptionRenewalEmail({ 
  brand, 
  firstName, 
  subscriptionName, 
  renewalDate, 
  amount, 
  currency, 
  dashboardUrl, 
  supportEmail, 
  logoUrl, 
  websiteUrl 
}) {
  const year = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8" /><title>Your ${brand} subscription renewal</title></head>
  <body style="margin:0;padding:0;background:#FFF5EA;font-family:Arial,sans-serif;color:#111827;">
    <table style="max-width:640px;margin:0 auto;background:#fff;">
      <tr><td style="padding:24px;text-align:center;background:#004AAA;color:#fff;">
        <img src="${logoUrl}" alt="${brand} logo" style="max-width:160px;margin-bottom:8px;" />
        <div style="font-size:18px;font-weight:600;">Subscription Renewal Reminder</div>
      </td></tr>
      <tr><td style="padding:32px;">
        <h1 style="color:#FD8100;">Hi ${firstName},</h1>
        <p>This is a friendly reminder that your <strong>${subscriptionName}</strong> subscription will renew soon.</p>
        <div style="background:#FFE89C;border-radius:12px;padding:20px;margin:16px 0;">
          <p><strong>Renewal Date:</strong> ${renewalDate}</p>
          <p><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
        </div>
        <p>If you’d like to manage your subscription, you can do so in your dashboard.</p>
        <p><a href="${dashboardUrl}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#FEB803;color:#fff;text-decoration:none;font-weight:600;">Manage Subscription</a></p>
        <p style="font-size:14px;color:#6b7280;">Need help? Contact <a href="mailto:${supportEmail}" style="color:#004AAA;">${supportEmail}</a>.</p>
      </td></tr>
      <tr><td style="padding:24px;text-align:center;font-size:13px;color:#8b6d0c;">
        © ${year} ${brand} · <a href="${websiteUrl}" style="color:#004AAA;text-decoration:none;">${websiteUrl}</a>
      </td></tr>
    </table>
  </body>
  </html>`;
}

function subscriptionActivatedEmail({
  brand,
  firstName,
  subscriptionName,
  dashboardUrl,
  supportEmail,
  logoUrl,
  websiteUrl
}) {
  const year = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8" /><title>Your ${brand} subscription is active</title></head>
  <body style="margin:0;padding:0;background:#FFF5EA;font-family:Arial,sans-serif;color:#111827;">
    <table style="max-width:640px;margin:0 auto;background:#fff;">

      <tr>
        <td style="padding:24px;text-align:center;background:#004AAA;color:#fff;">
          <img src="${logoUrl}" style="max-width:160px;margin-bottom:8px;" />
          <div style="font-size:18px;font-weight:600;">Subscription Activated</div>
        </td>
      </tr>

      <tr>
        <td style="padding:32px;">
          <h1 style="color:#FD8100;">Hi ${firstName},</h1>
          <p>Your <strong>${subscriptionName}</strong> subscription is now active.</p>

          <div style="background:#FFEBD2;border-radius:12px;padding:20px;margin:16px 0;">
            <p>You now have full access to your subscription benefits.</p>
          </div>

          <p>
            <a href="${dashboardUrl}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#FEB803;color:#fff;text-decoration:none;font-weight:600;">
              Go to Dashboard
            </a>
          </p>

          <p style="font-size:14px;color:#6b7280;">
            Need help? Contact <a href="mailto:${supportEmail}" style="color:#004AAA;">${supportEmail}</a>.
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:24px;text-align:center;font-size:13px;color:#8b6d0c;">
          © ${year} ${brand} · <a href="${websiteUrl}" style="color:#004AAA;">${websiteUrl}</a>
        </td>
      </tr>

    </table>
  </body>
  </html>`;
}
function subscriptionCancelledEmail({
  brand,
  firstName,
  subscriptionName,
  endDate,
  supportEmail,
  logoUrl,
  websiteUrl
}) {
  const year = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8" /><title>Your ${brand} subscription has been cancelled</title></head>
  <body style="margin:0;padding:0;background:#FFF5EA;font-family:Arial,sans-serif;color:#111827;">
    <table style="max-width:640px;margin:0 auto;background:#fff;">

      <tr>
        <td style="padding:24px;text-align:center;background:#004AAA;color:#fff;">
          <img src="${logoUrl}" style="max-width:160px;margin-bottom:8px;" />
          <div style="font-size:18px;font-weight:600;">Subscription Cancelled</div>
        </td>
      </tr>

      <tr>
        <td style="padding:32px;">
          <h1 style="color:#FD8100;">Hi ${firstName},</h1>
          <p>Your <strong>${subscriptionName}</strong> subscription has been cancelled.</p>

          <div style="background:#FFE0B3;border-radius:12px;padding:20px;margin:16px 0;">
            <p>Your access will continue until <strong>${endDate}</strong>.</p>
          </div>

          <p style="font-size:14px;color:#6b7280;">
            If this was a mistake or you’d like to reactivate, contact us at 
            <a href="mailto:${supportEmail}" style="color:#004AAA;">${supportEmail}</a>.
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:24px;text-align:center;font-size:13px;color:#8b6d0c;">
          © ${year} ${brand} · <a href="${websiteUrl}" style="color:#004AAA;">${websiteUrl}</a>
        </td>
      </tr>

    </table>
  </body>
  </html>`;
}
function subscriptionPaymentFailedEmail({
  brand,
  firstName,
  subscriptionName,
  retryDate,
  supportEmail,
  dashboardUrl,
  logoUrl,
  websiteUrl
}) {
  const year = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8" /><title>Payment failed for your ${brand} subscription</title></head>
  <body style="margin:0;padding:0;background:#FFF5EA;font-family:Arial,sans-serif;color:#111827;">
    <table style="max-width:640px;margin:0 auto;background:#fff;">

      <tr>
        <td style="padding:24px;text-align:center;background:#004AAA;color:#fff;">
          <img src="${logoUrl}" style="max-width:160px;margin-bottom:8px;" />
          <div style="font-size:18px;font-weight:600;">Payment Failed</div>
        </td>
      </tr>

      <tr>
        <td style="padding:32px;">
          <h1 style="color:#FD8100;">Hi ${firstName},</h1>
          <p>We were unable to process your payment for <strong>${subscriptionName}</strong>.</p>

          <div style="background:#FFE0B3;border-radius:12px;padding:20px;margin:16px 0;">
            <p>We will retry the payment on <strong>${retryDate}</strong>.</p>
          </div>

          <p>Please update your billing details to avoid interruption.</p>

          <p>
            <a href="${dashboardUrl}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#FEB803;color:#fff;text-decoration:none;font-weight:600;">
              Update Billing Info
            </a>
          </p>

          <p style="font-size:14px;color:#6b7280;">
            Need help? Contact <a href="mailto:${supportEmail}" style="color:#004AAA;">${supportEmail}</a>.
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:24px;text-align:center;font-size:13px;color:#8b6d0c;">
          © ${year} ${brand} · <a href="${websiteUrl}" style="color:#004AAA;">${websiteUrl}</a>
        </td>
      </tr>

    </table>
  </body>
  </html>`;
}
function lowCreditsWarningEmail({
  brand,
  firstName,
  remainingCredits,
  dashboardUrl,
  supportEmail,
  logoUrl,
  websiteUrl
}) {
  const year = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8" /><title>Your ${brand} credits are running low</title></head>
  <body style="margin:0;padding:0;background:#FFF5EA;font-family:Arial,sans-serif;color:#111827;">
    <table style="max-width:640px;margin:0 auto;background:#fff;">

      <tr>
        <td style="padding:24px;text-align:center;background:#004AAA;color:#fff;">
          <img src="${logoUrl}" style="max-width:160px;margin-bottom:8px;" />
          <div style="font-size:18px;font-weight:600;">Low Credits Warning</div>
        </td>
      </tr>

      <tr>
        <td style="padding:32px;">
          <h1 style="color:#FD8100;">Hi ${firstName},</h1>
          <p>You’re running low on credits.</p>

          <div style="background:#FFEBD2;border-radius:12px;padding:20px;margin:16px 0;">
            <p><strong>Remaining Credits:</strong> ${remainingCredits}</p>
          </div>

          <p>You can purchase more credits or upgrade your subscription anytime.</p>

          <p>
            <a href="${dashboardUrl}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#FEB803;color:#fff;text-decoration:none;font-weight:600;">
              Add More Credits
            </a>
          </p>

          <p style="font-size:14px;color:#6b7280;">
            Need help? Contact <a href="mailto:${supportEmail}" style="color:#004AAA;">${supportEmail}</a>.
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:24px;text-align:center;font-size:13px;color:#8b6d0c;">
          © ${year} ${brand} · <a href="${websiteUrl}" style="color:#004AAA;">${websiteUrl}</a>
        </td>
      </tr>

    </table>
  </body>
  </html>`;
}

// Export all functions (CommonJS)
module.exports = {
  welcomeEmail,
  purchaseEmail,
  resetPasswordEmail,
  subscriptionRenewalEmail,
  subscriptionActivatedEmail,
  subscriptionCancelledEmail,
  subscriptionPaymentFailedEmail,
  lowCreditsWarningEmail
};

// Class Booking Confirmation Email Template
function classBookingEmail({
  brand,
  firstName,
  className,
  classDate,
  classTime,
  instructor,
  dashboardUrl,
  supportEmail,
  logoUrl,
  websiteUrl
}) {
  const year = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head><meta charset="UTF-8" /><title>Your ${brand} class booking</title></head>
  <body style="margin:0;padding:0;background:#FFF5EA;font-family:Arial,sans-serif;color:#111827;">
    <table style="max-width:640px;margin:0 auto;background:#fff;">
      <tr>
        <td style="padding:24px;text-align:center;background:#004AAA;color:#fff;">
          <img src="${logoUrl}" alt="${brand} logo" style="max-width:160px;margin-bottom:8px;" />
          <div style="font-size:18px;font-weight:600;">Class Booking Confirmation</div>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          <h1 style="margin:0 0 12px;font-size:22px;color:#FD8100;">Hi ${firstName}, your spot is reserved!</h1>
          <p>You’ve successfully booked a class with ${brand}. Here are your details:</p>
          <div style="background:#B3C9F5;border-radius:12px;padding:20px;margin:16px 0;">
            <p><strong>Class:</strong> ${className}</p>
            <p><strong>Date:</strong> ${classDate}</p>
            <p><strong>Time:</strong> ${classTime}</p>
            <p><strong>Instructor:</strong> ${instructor}</p>
          </div>
          <p><a href="${dashboardUrl}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#FEB803;color:#fff;text-decoration:none;font-weight:600;">View in Dashboard</a></p>
          <p style="font-size:14px;color:#6b7280;">Need to reschedule? Contact <a href="mailto:${supportEmail}" style="color:#004AAA;">${supportEmail}</a>.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;text-align:center;font-size:13px;color:#8b6d0c;">
          © ${year} ${brand} · <a href="${websiteUrl}" style="color:#004AAA;text-decoration:none;">${websiteUrl}</a>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}
