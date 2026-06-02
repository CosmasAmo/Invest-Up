// Professional Email Templates for Invest Up
// Enhanced with modern design, better branding, and improved user experience

const BASE_STYLES = `
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    color: #1a202c;
    line-height: 1.6;
  }

  table, td {
    border-collapse: collapse;
  }

  .email-wrapper {
    width: 100%;
    min-height: 100vh;
    padding: 20px 0;
  }

  .email-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .email-header {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    padding: 40px 30px;
    text-align: center;
    position: relative;
  }

  .email-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }

  .brand-logo {
    position: relative;
    z-index: 1;
  }

  .brand-name {
    color: #ffffff;
    margin: 0;
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .brand-tagline {
    color: rgba(255, 255, 255, 0.9);
    margin: 8px 0 0 0;
    font-size: 16px;
    font-weight: 500;
  }

  .email-content {
    padding: 50px 40px;
    color: #2d3748;
  }

  .email-title {
    font-size: 28px;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 30px 0;
    line-height: 1.2;
  }

  .email-greeting {
    font-size: 18px;
    color: #4a5568;
    margin: 0 0 25px 0;
  }

  .email-body {
    font-size: 16px;
    color: #4a5568;
    margin: 0 0 25px 0;
    line-height: 1.7;
  }

  .highlight {
    color: #1e3a8a;
    font-weight: 600;
    background: linear-gradient(120deg, rgba(30, 58, 138, 0.1) 0%, rgba(30, 58, 138, 0.1) 100%);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .otp-container {
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 25px;
    margin: 30px 0;
    text-align: center;
    position: relative;
  }

  .otp-container::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, #1e3a8a, #1e40af);
    border-radius: 14px;
    z-index: -1;
  }

  .otp-code {
    font-size: 32px;
    font-weight: 800;
    color: #1e3a8a;
    letter-spacing: 8px;
    font-family: 'Courier New', monospace;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .otp-label {
    font-size: 14px;
    color: #718096;
    margin-top: 10px;
    font-weight: 500;
  }

  .cta-button {
    display: inline-block;
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    color: #ffffff;
    text-decoration: none;
    padding: 16px 32px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 12px;
    margin: 25px 0;
    box-shadow: 0 4px 15px rgba(30, 58, 138, 0.3);
    transition: all 0.3s ease;
  }

  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(30, 58, 138, 0.4);
  }

  .info-box {
    background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
    border-left: 4px solid #1e3a8a;
    padding: 20px;
    border-radius: 8px;
    margin: 25px 0;
  }

  .info-box-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e3a8a;
    margin: 0 0 10px 0;
  }

  .info-box-content {
    font-size: 14px;
    color: #4a5568;
    margin: 0;
  }

  .success-box {
    background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
    border-left: 4px solid #1e3a8a;
    padding: 20px;
    border-radius: 8px;
    margin: 25px 0;
  }

  .warning-box {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border-left: 4px solid #f59e0b;
    padding: 20px;
    border-radius: 8px;
    margin: 25px 0;
  }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
    margin: 40px 0;
  }

  .success-icon {
    display: inline-block;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #22D172 0%, #16a085 100%);
    border-radius: 50%;
    text-align: center;
    line-height: 60px;
    color: white;
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 20px;
    box-shadow: 0 4px 15px rgba(34, 209, 114, 0.3);
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin: 30px 0;
  }

  .feature-item {
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    border: 1px solid #e2e8f0;
  }

  .feature-icon {
    font-size: 24px;
    margin-bottom: 10px;
  }

  .feature-title {
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 8px 0;
  }

  .feature-description {
    font-size: 14px;
    color: #718096;
    margin: 0;
  }

  .email-footer {
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    padding: 30px 40px;
    text-align: center;
    border-top: 1px solid #e2e8f0;
  }

  .footer-text {
    font-size: 14px;
    color: #718096;
    margin: 0 0 10px 0;
  }

  @media only screen and (max-width: 600px) {
    .email-wrapper {
      padding: 10px;
    }
    
    .email-container {
      border-radius: 12px;
    }
    
    .email-header {
      padding: 30px 20px;
    }
    
    .brand-name {
      font-size: 28px;
    }
    
    .email-content {
      padding: 40px 25px;
    }
    
    .email-title {
      font-size: 24px;
    }
    
    .otp-code {
      font-size: 28px;
      letter-spacing: 6px;
    }
    
    .email-footer {
      padding: 25px 20px;
    }
    
    .feature-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export const EMAIL_VERIFY_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Invest Up - Email Verification</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    ${BASE_STYLES}
  </style>
</head>

<body>
  <div class="email-wrapper">
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center">
          <table class="email-container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td class="email-header">
                <div class="brand-logo">
                  <h1 class="brand-name">INVEST UP</h1>
                  <p class="brand-tagline">Your Gateway to Smart Investments</p>
                </div>
              </td>
            </tr>
            <tr>
              <td class="email-content">
                <h2 class="email-title">Verify Your Email Address</h2>
                <p class="email-greeting">Hello there! 👋</p>
                <p class="email-body">
                  Welcome to <span class="highlight">Invest Up</span>! We're excited to have you join our community of smart investors. 
                  To complete your registration and unlock access to your investment dashboard, please verify your email address: 
                  <span class="highlight">{{email}}</span>
                </p>
                
                <div class="otp-container">
                  <div class="otp-code">{{otp}}</div>
                  <div class="otp-label">Your Verification Code</div>
                </div>
                
                <div class="info-box">
                  <div class="info-box-title">⏰ Important</div>
                  <div class="info-box-content">
                    This verification code is valid for 15 minutes. If you didn't request this verification, 
                    please ignore this email or contact our support team immediately.
                  </div>
                </div>
                
                <p class="email-body">
                  Once verified, you'll have access to our advanced investment platform, real-time market data, 
                  and personalized investment strategies designed to help you achieve your financial goals.
                </p>
                
                <div class="divider"></div>
                
                <p class="email-body" style="font-size: 14px; color: #718096;">
                  Need help? Our support team is available 24/7 to assist you with any questions or concerns.
                </p>
              </td>
            </tr>
            <tr>
              <td class="email-footer">
                <p class="footer-text">© ${new Date().getFullYear()} Invest Up. All rights reserved.</p>
                <p class="footer-text">This is an automated message, please do not reply to this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Invest Up - Password Reset</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    ${BASE_STYLES}
  </style>
</head>

<body>
  <div class="email-wrapper">
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center">
          <table class="email-container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td class="email-header">
                <div class="brand-logo">
                  <h1 class="brand-name">INVEST UP</h1>
                  <p class="brand-tagline">Your Gateway to Smart Investments</p>
                </div>
              </td>
            </tr>
            <tr>
              <td class="email-content">
                <h2 class="email-title">Password Reset Request</h2>
                <p class="email-greeting">Hello there! 🔐</p>
                <p class="email-body">
                  We received a request to reset the password for your <span class="highlight">Invest Up</span> account: 
                  <span class="highlight">{{email}}</span>
                </p>
                
                <div class="otp-container">
                  <div class="otp-code">{{otp}}</div>
                  <div class="otp-label">Your Password Reset Code</div>
                </div>
                
                <div class="info-box">
                  <div class="info-box-title">🔒 Security Notice</div>
                  <div class="info-box-content">
                    This code is valid for 15 minutes only. If you didn't request a password reset, 
                    please ignore this email or contact our support team immediately for security assistance.
                  </div>
                </div>
                
                <p class="email-body">
                  For your security, this email was sent to the email address associated with your Invest Up account. 
                  If you have any concerns about your account security, please don't hesitate to reach out to our support team.
                </p>
                
                <div class="divider"></div>
                
                <p class="email-body" style="font-size: 14px; color: #718096;">
                  Remember: Never share your password or verification codes with anyone, including our support team.
                </p>
              </td>
            </tr>
            <tr>
              <td class="email-footer">
                <p class="footer-text">© ${new Date().getFullYear()} Invest Up. All rights reserved.</p>
                <p class="footer-text">This is an automated message, please do not reply to this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Invest Up - Password Reset Successful</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    ${BASE_STYLES}
  </style>
</head>

<body>
  <div class="email-wrapper">
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center">
          <table class="email-container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td class="email-header">
                <div class="brand-logo">
                  <h1 class="brand-name">INVEST UP</h1>
                  <p class="brand-tagline">Your Gateway to Smart Investments</p>
                </div>
              </td>
            </tr>
            <tr>
              <td class="email-content" style="text-align: center;">
                <div class="success-icon">✓</div>
                <h2 class="email-title">Password Reset Successful</h2>
                <p class="email-greeting">Hello there! 🎉</p>
                <p class="email-body">
                  Great news! Your password for your <span class="highlight">Invest Up</span> account 
                  <span class="highlight">{{email}}</span> has been successfully reset.
                </p>
                
                <div class="info-box">
                  <div class="info-box-title">🔐 Security Alert</div>
                  <div class="info-box-content">
                    If you did not request this password reset, please contact our support team immediately 
                    as your account security may have been compromised.
                  </div>
                </div>
                
                <p class="email-body">
                  You can now log in to your account with your new password. We recommend using a strong, 
                  unique password and enabling two-factor authentication for enhanced security.
                </p>
                
                <div class="divider"></div>
                
                <p class="email-body" style="font-size: 14px; color: #718096;">
                  For security reasons, this email was sent to the email address associated with your Invest Up account.
                </p>
              </td>
            </tr>
            <tr>
              <td class="email-footer">
                <p class="footer-text">© ${new Date().getFullYear()} Invest Up. All rights reserved.</p>
                <p class="footer-text">This is an automated message, please do not reply to this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Invest Up - Welcome to Your Investment Journey</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    ${BASE_STYLES}
  </style>
</head>

<body>
  <div class="email-wrapper">
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center">
          <table class="email-container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td class="email-header">
                <div class="brand-logo">
                  <h1 class="brand-name">INVEST UP</h1>
                  <p class="brand-tagline">Your Gateway to Smart Investments</p>
                </div>
              </td>
            </tr>
            <tr>
              <td class="email-content">
                <h2 class="email-title">Welcome to Invest Up! 🚀</h2>
                <p class="email-greeting">Hello {{name}}! 👋</p>
                <p class="email-body">
                  Congratulations! Your <span class="highlight">Invest Up</span> account has been successfully verified and activated. 
                  You're now ready to start your investment journey with one of the most advanced trading platforms available.
                </p>
                
                <div class="success-box">
                  <div class="info-box-title">🎉 Account Successfully Activated</div>
                  <div class="info-box-content">
                    Your account is now fully functional and ready for trading. You can access all features including 
                    real-time market data, advanced trading tools, and personalized investment strategies.
                  </div>
                </div>
                
                <div class="feature-grid">
                  <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <div class="feature-title">Real-time Analytics</div>
                    <div class="feature-description">Advanced market insights and data visualization</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">🔒</div>
                    <div class="feature-title">Secure Trading</div>
                    <div class="feature-description">Bank-level security for your investments</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">📱</div>
                    <div class="feature-title">Mobile Access</div>
                    <div class="feature-description">Trade anywhere with our mobile app</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">💬</div>
                    <div class="feature-title">24/7 Support</div>
                    <div class="feature-description">Expert assistance whenever you need it</div>
                  </div>
                </div>
                
                <p class="email-body">
                  To get started, log in to your dashboard and explore our investment opportunities. 
                  Our team of experts is here to guide you every step of the way.
                </p>
                
                <div class="divider"></div>
                
                <p class="email-body" style="font-size: 14px; color: #718096;">
                  Ready to start investing? Log in to your account and discover the world of opportunities waiting for you.
                </p>
              </td>
            </tr>
            <tr>
              <td class="email-footer">
                <p class="footer-text">© ${new Date().getFullYear()} Invest Up. All rights reserved.</p>
                <p class="footer-text">This is an automated message, please do not reply to this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

export const ACCOUNT_STATUS_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Invest Up - Account Status Update</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    ${BASE_STYLES}
  </style>
</head>

<body>
  <div class="email-wrapper">
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center">
          <table class="email-container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td class="email-header">
                <div class="brand-logo">
                  <h1 class="brand-name">INVEST UP</h1>
                  <p class="brand-tagline">Your Gateway to Smart Investments</p>
                </div>
              </td>
            </tr>
            <tr>
              <td class="email-content">
                <h2 class="email-title">Account Status Update</h2>
                <p class="email-greeting">Hello {{name}}! 📋</p>
                <p class="email-body">
                  We want to inform you about an important update regarding your <span class="highlight">Invest Up</span> account.
                </p>
                
                <div class="info-box">
                  <div class="info-box-title">📊 Account Status: {{status}}</div>
                  <div class="info-box-content">
                    {{message}}
                  </div>
                </div>
                
                <p class="email-body">
                  If you have any questions about this status update or need assistance, 
                  please don't hesitate to contact our support team. We're here to help!
                </p>
                
                <div class="divider"></div>
                
                <p class="email-body" style="font-size: 14px; color: #718096;">
                  Thank you for choosing Invest Up for your investment needs.
                </p>
              </td>
            </tr>
            <tr>
              <td class="email-footer">
                <p class="footer-text">© ${new Date().getFullYear()} Invest Up. All rights reserved.</p>
                <p class="footer-text">This is an automated message, please do not reply to this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

export const SUPPORT_REPLY_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Invest Up - Support Response</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    ${BASE_STYLES}
  </style>
</head>

<body>
  <div class="email-wrapper">
    <table width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center">
          <table class="email-container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td class="email-header">
                <div class="brand-logo">
                  <h1 class="brand-name">INVEST UP</h1>
                  <p class="brand-tagline">Your Gateway to Smart Investments</p>
                </div>
              </td>
            </tr>
            <tr>
              <td class="email-content">
                <h2 class="email-title">Support Response</h2>
                <p class="email-greeting">Hello {{name}}! 💬</p>
                <p class="email-body">
                  Thank you for contacting <span class="highlight">Invest Up</span> support. 
                  We have received your inquiry and our team has prepared a response for you.
                </p>
                
                <div class="info-box">
                  <div class="info-box-title">📝 Support Response</div>
                  <div class="info-box-content">
                    {{response}}
                  </div>
                </div>
                
                <p class="email-body">
                  If you need any clarification or have additional questions, 
                  please don't hesitate to reply to this email or contact us through our live chat.
                </p>
                
                <div class="divider"></div>
                
                <p class="email-body" style="font-size: 14px; color: #718096;">
                  Our support team is committed to providing you with the best possible assistance.
                </p>
              </td>
            </tr>
            <tr>
              <td class="email-footer">
                <p class="footer-text">© ${new Date().getFullYear()} Invest Up. All rights reserved.</p>
                <p class="footer-text">This is an automated message, please do not reply to this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`; 