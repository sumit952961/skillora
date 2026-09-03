import dotenv from "dotenv";
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const APP_NAME = process.env.APP_NAME || "SkillZeno";
const APP_URL = process.env.APP_URL || "https://skillora.vercel.app";
const LOGIN_URL = `${APP_URL}/login`;

const SENDER_EMAIL = "skillzeno26@gmail.com";
const SENDER_NAME = APP_NAME;

const baseTemplate = (content) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
  <div style="background:#4f46e5;padding:24px;text-align:center;">
    <h1 style="color:#ffffff;margin:0;font-size:24px;">${APP_NAME}</h1>
  </div>
  <div style="padding:32px 24px;color:#374151;font-size:16px;line-height:1.6;">
    ${content}
  </div>
  <div style="background:#f3f4f6;padding:16px;text-align:center;font-size:14px;color:#6b7280;border-top:1px solid #e5e7eb;">
    &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br/>
    If you have any questions, please contact our support team.
  </div>
</div>
`;

const sendEmail = async ({ to, subject, html }) => {
  if (!BREVO_API_KEY) {
    console.error("BREVO_API_KEY is not set — email not sent.");
    return;
  }
  
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      "accept": "application/json"
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html
    }),
  });
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo API error (${res.status}): ${err}`);
  }
};

export const sendWelcomeEmail = async (name, email) => {
  const content = `
    <h2 style="color:#1f2937;margin-top:0;">Welcome to ${APP_NAME}, ${name}! 🎉</h2>
    <p>Your ${APP_NAME} account is ready. Start exploring opportunities, building practical skills, and working on projects that support your learning and career journey.</p>
    <p>We are thrilled to have you on board!</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${LOGIN_URL}" style="background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;display:inline-block;">Login to Your Account</a>
    </div>
  `;
  await sendEmail({
    to: email,
    subject: `🎉 Welcome to ${APP_NAME}!`,
    html: baseTemplate(content),
  }).catch(console.error);
};

export const sendLoginNotification = async (name, email) => {
  const time = new Date().toLocaleString();
  const content = `
    <h2 style="color:#1f2937;margin-top:0;">New Login Detected 🔐</h2>
    <p>Hi ${name},</p>
    <p>We noticed a new login to your ${APP_NAME} account.</p>
    <div style="background:#f9fafb;padding:16px;border-radius:6px;margin:24px 0;">
      <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${email}</p>
      <p style="margin:0;"><strong>Time:</strong> ${time}</p>
    </div>
    <p style="font-size:14px;color:#6b7280;">If this was you, you can safely ignore this email. If you don't recognize this activity, please secure your account immediately by changing your password.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${LOGIN_URL}" style="background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;display:inline-block;">Go to My Account</a>
    </div>
  `;
  await sendEmail({
    to: email,
    subject: `🔐 New Login to Your ${APP_NAME} Account`,
    html: baseTemplate(content),
  }).catch(console.error);
};

export const sendPasswordResetOTP = async (name, email, otp) => {
  const content = `
    <h2 style="color:#1f2937;margin-top:0;">Password Reset Request</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Here is your One-Time Password (OTP):</p>
    <div style="text-align:center;margin:24px 0;">
      <h1 style="letter-spacing:6px;background:#f3f4f6;padding:16px;border-radius:8px;display:inline-block;margin:0;color:#1f2937;">${otp}</h1>
    </div>
    <p>This OTP will expire in 10 minutes. For security reasons, do not share this code with anyone.</p>
    <p style="font-size:14px;color:#6b7280;margin-top:24px;">If you didn't request this, please ignore this email or contact support.</p>
  `;
  await sendEmail({
    to: email,
    subject: `Your ${APP_NAME} Password Reset OTP`,
    html: baseTemplate(content),
  });
};

export const sendPasswordResetConfirmation = async (name, email) => {
  const time = new Date().toLocaleString();
  const content = `
    <h2 style="color:#1f2937;margin-top:0;">Password Updated Successfully 🎉</h2>
    <p>Hi ${name},</p>
    <p>Your ${APP_NAME} account password was successfully reset and updated on <strong>${time}</strong>.</p>
    <p>You can now log in using your new password.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${LOGIN_URL}" style="background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;display:inline-block;">Login Now</a>
    </div>
    <p style="font-size:14px;color:#6b7280;">If you did not perform this action, please contact our support team immediately.</p>
  `;
  await sendEmail({
    to: email,
    subject: `🎉 Your ${APP_NAME} Password Has Been Updated`,
    html: baseTemplate(content),
  }).catch(console.error);
};

export const sendPasswordChangeConfirmation = async (name, email) => {
  const time = new Date().toLocaleString();
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="background-color: #d1fae5; color: #059669; width: 64px; height: 64px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto;">
        ✅
      </div>
    </div>
    <h2 style="color:#1f2937;margin-top:0;text-align:center;">Password Changed Successfully!</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>This is a quick confirmation that you have successfully changed the password for your <strong>${APP_NAME}</strong> account on <strong>${time}</strong>.</p>
    <p>You can now use your new password to log in and continue your learning journey with us. 🚀</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${LOGIN_URL}" style="background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;display:inline-block;">Go to Login</a>
    </div>
    <div style="background:#fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin-top: 32px; border-radius: 4px;">
      <p style="font-size:14px;color:#991b1b;margin:0;"><strong>Security Notice:</strong> If you did not make this change, please contact our support team immediately to secure your account.</p>
    </div>
  `;
  await sendEmail({
    to: email,
    subject: `🔐 Your ${APP_NAME} Password Was Changed`,
    html: baseTemplate(content),
  }).catch(console.error);
};

export const sendAdminContestNotification = async (studentName, studentEmail, contestTitle, domain, score) => {
  const content = `
    <h2 style="color:#1f2937;margin-top:0;">New Contest Submission</h2>
    <p>A student has just submitted a contest assessment.</p>
    <div style="background:#f9fafb;padding:16px;border-radius:6px;margin:24px 0;">
      <p style="margin:0 0 8px 0;"><strong>Name:</strong> ${studentName}</p>
      <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${studentEmail}</p>
      <p style="margin:0 0 8px 0;"><strong>Contest:</strong> ${contestTitle}</p>
      <p style="margin:0 0 8px 0;"><strong>Domain:</strong> ${domain}</p>
      <p style="margin:0;"><strong>Score:</strong> ${score}</p>
    </div>
  `;
  await sendEmail({
    to: "skillzeno26@gmail.com",
    subject: `New Contest Submission: ${studentName}`,
    html: baseTemplate(content),
  }).catch(console.error);
};
