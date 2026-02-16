import crypto from "crypto";
import nodemailer from "nodemailer";

// ── Generate a 6-digit OTP ────────────────────────────────
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// ── Email transporter ─────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Send OTP via Email ────────────────────────────────────
export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Flamr 🔥" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Flamr verification code",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; border-radius: 12px; background: #0f0f0f; color: #fff;">
        <h1 style="color: #ff4458; margin-bottom: 8px;">Flamr 🔥</h1>
        <p style="color: #aaa; font-size: 15px;">Your one-time verification code is:</p>
        <div style="font-size: 42px; font-weight: 800; letter-spacing: 10px; color: #fff; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 13px;">This code expires in <strong style="color:#fff">10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border-color: #222; margin: 24px 0;" />
        <p style="color: #444; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ── Send OTP via SMS (Twilio) ─────────────────────────────
export const sendOTPSMS = async (phone, otp) => {
  // Dynamically import so app still runs if Twilio isn't configured
  const { default: twilio } = await import("twilio");
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  await client.messages.create({
    body: `Your Flamr verification code is: ${otp}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
};
