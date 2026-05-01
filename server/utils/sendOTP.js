const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (toEmail, name, otp) => {
  await transporter.sendMail({
    from: `"VoteApp" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 Your OTP for VoteApp Registration',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:30px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#4f46e5;text-align:center;">🗳️ VoteApp</h2>
        <h3 style="color:#1f2937;">Hello, ${name}!</h3>
        <p style="color:#6b7280;">Your admin has registered you on VoteApp. Use the OTP below to verify your identity:</p>
        <div style="text-align:center;margin:30px 0;">
          <div style="background:#f0f4ff;border:2px dashed #6366f1;border-radius:12px;padding:20px;display:inline-block;">
            <p style="margin:0;font-size:36px;font-weight:bold;letter-spacing:10px;color:#4f46e5;">${otp}</p>
          </div>
        </div>
        <p style="color:#6b7280;text-align:center;">This OTP expires in <strong>10 minutes</strong>.</p>
        <p style="color:#9ca3af;font-size:12px;text-align:center;">If you did not expect this, please ignore.</p>
      </div>
    `,
  });
};

module.exports = { generateOTP, sendOTPEmail };
