import nodemailer from "nodemailer";

// Simple OTP Service with direct configuration
class SimpleOtpService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Direct configuration with environment variables
      this.transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.GMAIL_USER || "fasthiremela@gmail.com",
          pass: process.env.GMAIL_APP_PASS || "giyf ozil lpwm wppf"
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates
        }
      });

      console.log('✅ Simple OTP Service initialized');
      console.log('GMAIL_USER:', process.env.GMAIL_USER);
      console.log('GMAIL_APP_PASS:', process.env.GMAIL_APP_PASS ? 'SET' : 'NOT SET');
    } catch (error) {
      console.error('❌ Failed to initialize OTP service:', error);
    }
  }

  async sendOtpEmail(email, otp) {
    if (!this.transporter) {
      throw new Error('Transporter not initialized');
    }

    const mailOptions = {
      from: `"FastHireMela" <${process.env.GMAIL_USER || "fasthiremela@gmail.com"}>`,
      to: email,
      subject: "Your OTP Code - FastHireMela",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #4f46e5; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">FastHireMela</h1>
            <p style="margin: 5px 0 0 0;">Email Verification</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Your OTP Code</h2>
            <p>Use the following code to verify your email:</p>
            
            <div style="background: white; padding: 20px; text-align: center; margin: 20px 0; border: 2px solid #4f46e5; border-radius: 8px;">
              <p style="font-size: 32px; font-weight: bold; letter-spacing: 3px; margin: 0; color: #4f46e5;">
                ${otp}
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              This code will expire in 24 hours. Do not share it with anyone.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent to ${email}:`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
      throw error;
    }
  }

  async verifyConnection() {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }

  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

// Create and export singleton instance
const simpleOtpService = new SimpleOtpService();

export const sendOtpEmail = (email, otp) => simpleOtpService.sendOtpEmail(email, otp);
export const verifyConnection = () => simpleOtpService.verifyConnection();
export const generateOtp = () => simpleOtpService.generateOtp();
export default simpleOtpService;
