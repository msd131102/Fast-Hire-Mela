import nodemailer from "nodemailer";

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS, // Not Gmail password!
  },
});

// Send OTP email
export const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: `FastHireMela <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code for FastHireMela Registration",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">FastHireMela</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Job Search Companion</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Email Verification Code</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for signing up with FastHireMela! To complete your registration, please use the following OTP:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; border: 2px dashed #667eea;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your OTP Code is:</p>
            <p style="font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #667eea; margin: 0;">
              ${otp}
            </p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⚠️ Important:</strong> This OTP will expire in <strong>10 minutes</strong>. 
              Please do not share this code with anyone.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px;">
          <p style="margin: 0;">If you didn't request this OTP, please ignore this email.</p>
          <p style="margin: 10px 0 0 0;">
            © 2024 FastHireMela. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

// Generate 6-digit OTP
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Verify transporter is working
export const verifyEmailService = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email service verification failed:', error);
    return false;
  }
};
