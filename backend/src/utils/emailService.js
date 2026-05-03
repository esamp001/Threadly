const fs = require('fs');
const path = require('path');

// SendGrid API option for Render free tier
const sendViaSendGridAPI = async (to, subject, htmlContent) => {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SendGrid API key not configured');
  }

  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const fromEmail = process.env.EMAIL_FROM

  console.log('📧 SendGrid API Details:');
  console.log('  To:', to);
  console.log('  From:', fromEmail);
  console.log('  Subject:', subject);

  const msg = {
    to,
    from: `"Space" <${fromEmail}>`,
    subject,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log('📧 SendGrid: Email sent successfully');
  } catch (error) {
    console.error('📧 SendGrid Error Details:', error.response?.body || error.message);
    throw error;
  }
};

/**
 * Send magic link email to user
 * This is used to send passwordless authentication links with minimalist Space branding
 * Works on both Render free tier (via SendGrid API) and paid tiers (via SMTP)
 * @param {string} to - Recipient email address
 * @param {string} magicLink - Magic link URL for authentication
 * @param {string} userName - User's name (optional)
 * @returns {Object} - Email sending result
 */
const sendMagicLinkEmail = async (to, magicLink, userName = '') => {
  try {
    const displayName = userName || to.split('@')[0];

    const htmlContent = `
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Space - Sign In</title>
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

    // Use SendGrid API (works on Render free tier and production)
    console.log('📧 Email service: Using SendGrid API');
    await sendViaSendGridAPI(to, 'Sign In to Space - One-Time Link', htmlContent);
    return { success: true, messageId: 'sendgrid-api-' + Date.now() };

  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  sendMagicLinkEmail,
};
