const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

/**
 * Email Service Utility
 * Handles sending emails using Nodemailer with SMTP configuration
 * 
 * Supports:
 * - Gmail SMTP
 * - Custom SMTP providers
 * - SendGrid (via SMTP)
 * - Development mode (console logging)
 */

/**
 * Create email transporter based on environment configuration
 * This is used to establish connection with email service provider
 * @returns {Object} - Nodemailer transporter instance
 */
const createTransporter = () => {
  // Load environment variables from .env.development if needed
  require('dotenv').config({ path: '.env.development' });

  // Development mode - log to console
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_HOST) {
    return {
      sendMail: async (options) => {
        return { messageId: 'dev-mode-' + Date.now() };
      }
    };
  }

  // Production mode - use real SMTP
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send magic link email to user
 * This is used to send passwordless authentication links with minimalist Space branding
 * @param {string} to - Recipient email address
 * @param {string} magicLink - Magic link URL for authentication
 * @param {string} userName - User's name (optional)
 * @returns {Object} - Email sending result
 */
const sendMagicLinkEmail = async (to, magicLink, userName = '') => {
  try {
    const transporter = createTransporter();

    const displayName = userName || to.split('@')[0];


    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Space - Magic Link Sign In</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #ffffff; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; }
          .logo { text-align: center; margin-bottom: 40px; }
          .logo img { max-width: 150px; height: auto; }
          .content { text-align: center; }
          .greeting { font-size: 24px; font-weight: 600; margin-bottom: 10px; color: #121212; }
          .message { font-size: 16px; color: #666; margin-bottom: 30px; }
          .button { display: inline-block; background: #1DB954; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
          .button:hover { background: #1aa34a; }
          .security-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: left; }
          .security-info h3 { margin: 0 0 10px 0; font-size: 16px; color: #121212; }
          .security-info p { margin: 5px 0; font-size: 14px; color: #666; }
          .expiry { color: #e74c3c; font-weight: 600; }
          .link-fallback { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; word-break: break-all; font-family: monospace; font-size: 12px; color: #666; }
          .footer { text-align: center; padding: 20px; color: #999; font-size: 14px; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1 style="margin: 0; font-size: 2.5rem; font-weight: 700; letter-spacing: 2px;">
              <span style="color: #000000;">SPAC</span><span style="color: #1DB954;">E</span>
            </h1>
          </div>
          
          <div class="content">
            <p class="greeting">Hello ${displayName},</p>
            <p class="message">Welcome to Space! Click the button below to sign in automatically.</p>
            
            <p style="font-size: 14px; color: #666; margin: 20px 0; line-height: 1.6;">
              Space is a modern discussion platform where you can explore topic-based Spaces, share ideas through Threads, and connect with communities. Like Reddit, it's designed to help you discover new interests and engage with like-minded people in organized, meaningful conversations.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
              <h4 style="margin: 0 0 15px 0; color: #121212; font-size: 16px;">What you can do on Space:</h4>
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.8;">
                Join topic-based Spaces that match your interests, create and participate in Threads to share ideas, discover new communities and like-minded people, engage in organized, meaningful conversations, and build your reputation through the EXP system.
              </p>
            </div>
            
            <a href="${magicLink}" class="button" style="color: white !important; text-decoration: none;">Sign In to Space</a>
            
            <div class="security-info">
              <h3>🔒 Security Information</h3>
              <p>This link expires in <span class="expiry">15 minutes</span> for your security.</p>
              <p>If you didn't request this sign-in link, you can safely ignore this email.</p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">Having trouble? Copy and paste this link:</p>
            <div class="link-fallback">
              ${magicLink}
            </div>
          </div>
          
          <div class="footer">
            <p>Space - Where Communities Connect</p>
            <p>This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Space" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Sign In to Space - Magic Link',
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);

    return { success: true, messageId: result.messageId };

  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Test email configuration with Ethereal
 * This is used to test email sending with real credentials
 * @returns {Object} - Test result with Ethereal credentials
 */
const testEmailService = async () => {
  try {
    // Create test account with Ethereal
    const testAccount = await nodemailer.createTestAccount();

    return {
      success: true,
      message: 'Ethereal test account created',
      credentials: testAccount
    };
  } catch (error) {
    return { success: false, message: `Email service error: ${error.message}` };
  }
};

/**
 * Create Ethereal transporter for testing
 * This is used when Gmail authentication fails
 * @returns {Object} - Ethereal transporter instance
 */
const createEtherealTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

module.exports = {
  sendMagicLinkEmail,
  testEmailService,
  createTransporter,
};
