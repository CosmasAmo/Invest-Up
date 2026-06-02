import Contact from '../models/Contact.js';
import User from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const submitMessage = async (req, res) => {
    try {
        // Add CORS headers to ensure OPTIONS preflight requests work properly
        const origin = req.headers.origin;
        if (origin) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        } else {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }

        const { name, email, subject, message } = req.body;
        
        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        console.log(`Processing contact form submission from: ${name} <${email}>`);

        // Create the contact message
        const contactMessage = await Contact.create({
            name,
            email,
            subject,
            message
        });
        
        // Simplified confirmation email structure for better deliverability
        const userMailOptions = {
            from: {
                name: process.env.SENDER_NAME || 'Invest Up Support',
                address: process.env.SENDER_EMAIL || 'investup.support@investuptrading.com'
            },
            to: email,
            subject: 'Thank you for contacting us',
            text: `Thank you for contacting us, ${name}!

We have received your message regarding "${subject}".
Our team will review your inquiry and respond as soon as possible.

For reference, here's a copy of your message:
${message}

We typically respond to inquiries within 24-48 hours during business days.

Best regards,
Invest Up Support Team`,
            html: `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Invest Up - Thank You for Contacting Us</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
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

    .message-box {
      background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
      border-left: 4px solid #1e3a8a;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }

    .message-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e3a8a;
      margin: 0 0 10px 0;
    }

    .message-content {
      font-size: 14px;
      color: #4a5568;
      margin: 0;
      line-height: 1.6;
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
      margin: 40px 0;
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
      
      .email-footer {
        padding: 25px 20px;
      }
    }
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
                <h1 class="brand-name">INVEST UP</h1>
                <p class="brand-tagline">Your Gateway to Smart Investments</p>
              </td>
            </tr>
            <tr>
              <td class="email-content">
                <h2 class="email-title">Thank You for Contacting Us</h2>
                <p class="email-greeting">Hello ${name}! 👋</p>
                <p class="email-body">
                  Thank you for reaching out to <span class="highlight">Invest Up</span>. We have received your message regarding 
                  <span class="highlight">"${subject}"</span> and our team will review your inquiry and respond as soon as possible.
                </p>
                
                <div class="message-box">
                  <div class="message-title">📝 Your Message</div>
                  <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
                </div>
                
                <p class="email-body">
                  We typically respond to inquiries within 24-48 hours during business days. 
                  If your inquiry is urgent, please don't hesitate to contact us through our live chat or phone support.
                </p>
                
                <div class="divider"></div>
                
                <p class="email-body" style="font-size: 14px; color: #718096;">
                  Our support team is committed to providing you with the best possible assistance for all your investment needs.
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
            `
        };

        // Send confirmation email to user
        try {
            console.log('SMTP configuration for contact email:', {
                host: process.env.SMTP_HOST || 'indra.vivawebhost.com',
                port: process.env.SMTP_PORT || '465',
                user: process.env.SMTP_USER || 'accounts@investuptrading.com',
                sender: process.env.SENDER_EMAIL || 'accounts@investuptrading.com',
                recipient: email
            });
            
            // Send confirmation email
            const info = await transporter.sendMail(userMailOptions);
            console.log('Confirmation email sent:', info.messageId);

            // --- Send notification email to admin inbox ---
            const adminEmail = process.env.SENDER_EMAIL || 'accounts@investuptrading.com';
            const adminMailOptions = {
                from: {
                    name: process.env.SENDER_NAME || 'Invest Up Website',
                    address: adminEmail
                },
                to: adminEmail,
                subject: `New Contact Us Message from ${name}`,
                text: `You have received a new contact form submission.

Name: ${name}
Email: ${email}
Subject: ${subject}
Message:
${message}`,
                html: `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Invest Up - New Contact Message</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
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

    .contact-info {
      background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
      border-left: 4px solid #1e3a8a;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }

    .contact-info-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e3a8a;
      margin: 0 0 15px 0;
    }

    .contact-detail {
      font-size: 14px;
      color: #4a5568;
      margin: 8px 0;
    }

    .contact-label {
      font-weight: 600;
      color: #1e3a8a;
    }

    .message-box {
      background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
      border-left: 4px solid #1e3a8a;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }

    .message-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e3a8a;
      margin: 0 0 10px 0;
    }

    .message-content {
      font-size: 14px;
      color: #4a5568;
      margin: 0;
      line-height: 1.6;
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
      margin: 40px 0;
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
      
      .email-footer {
        padding: 25px 20px;
      }
    }
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
                <h1 class="brand-name">INVEST UP</h1>
                <p class="brand-tagline">Your Gateway to Smart Investments</p>
              </td>
            </tr>
            <tr>
              <td class="email-content">
                <h2 class="email-title">New Contact Form Submission</h2>
                <p class="email-greeting">Hello Admin! 📧</p>
                <p class="email-body">
                  You have received a new contact form submission from the Invest Up website. 
                  Please review the details below and respond accordingly.
                </p>
                
                <div class="contact-info">
                  <div class="contact-info-title">👤 Contact Information</div>
                  <div class="contact-detail">
                    <span class="contact-label">Name:</span> ${name}
                  </div>
                  <div class="contact-detail">
                    <span class="contact-label">Email:</span> ${email}
                  </div>
                  <div class="contact-detail">
                    <span class="contact-label">Subject:</span> ${subject}
                  </div>
                </div>
                
                <div class="message-box">
                  <div class="message-title">💬 Message Content</div>
                  <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
                </div>
                
                <div class="divider"></div>
                
                <p class="email-body" style="font-size: 14px; color: #718096;">
                  This message was sent from the website contact form. Please respond to the user's email address provided above.
                </p>
              </td>
            </tr>
            <tr>
              <td class="email-footer">
                <p class="footer-text">© ${new Date().getFullYear()} Invest Up. All rights reserved.</p>
                <p class="footer-text">This is an automated message from the website contact form.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
                `
            };
            try {
                const adminInfo = await transporter.sendMail(adminMailOptions);
                console.log('Admin notification email sent:', adminInfo.messageId);
            } catch (adminEmailError) {
                console.error('Failed to send admin notification email:', adminEmailError);
            }
            // --- End admin notification ---
            
            return res.json({ 
                success: true, 
                message: 'Your message has been sent successfully! We will contact you soon.',
                contact: contactMessage 
            });
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            
            // Still return success since the message was saved
            return res.json({ 
                success: true, 
                message: 'Your message has been sent successfully, but we could not send you a confirmation email. We will contact you soon.',
                contact: contactMessage,
                emailError: emailError.message
            });
        }
    } catch (error) {
        console.error('Error in submitMessage:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to send your message. Please try again later.',
            error: error.message 
        });
    }
};

export const getMessages = async (req, res) => {
    try {
        const messages = await Contact.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        res.json({ success: true, messages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.body;
        await Contact.update(
            { status: 'read' },
            { where: { id: messageId } }
        );
        
        res.json({ success: true, message: 'Message marked as read' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getUserMessages = async (req, res) => {
    try {
        const messages = await Contact.findAll({
            where: { userId: req.userId },
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });
        
        res.json({ success: true, messages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const replyToMessage = async (req, res) => {
    try {
        const { messageId, reply } = req.body;
        const message = await Contact.findByPk(messageId);
        
        if (!message) {
            return res.json({ success: false, message: 'Message not found' });
        }

        console.log('Attempting to send reply to:', message.email);
        
        // First, update the message with the reply in the database
        // This ensures that even if email fails, the reply is saved
        await message.update({ 
            reply,
            status: 'replied'
        });
        
        // Create a unique message ID for tracking
        const emailMessageId = `reply-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        
        // Enhanced logging for troubleshooting
        console.log('Email configuration when attempting to send reply:');
        console.log('- SMTP_HOST:', process.env.SMTP_HOST || 'not set');
        console.log('- SMTP_PORT:', process.env.SMTP_PORT || 'not set');
        console.log('- SENDER_EMAIL:', process.env.SENDER_EMAIL || 'not set');
        console.log('- SMTP_USER:', process.env.SMTP_USER ? 'set' : 'not set');
        console.log('- SMTP_PASS:', process.env.SMTP_PASS ? 'set' : 'not set');
        
        // Simplified email structure for better deliverability
        const mailOptions = {
            from: {
                name: process.env.SENDER_NAME || 'Invest Up Support',
                address: process.env.SENDER_EMAIL
            },
            to: message.email,
            subject: `Re: ${message.subject}`,
            text: `Hello ${message.name},

Thank you for contacting Invest Up support. We've reviewed your message and have the following response:

YOUR ORIGINAL MESSAGE:
${message.message}

OUR RESPONSE:
${reply}

If you have any further questions, please don't hesitate to contact us again.

Best regards,
Invest Up Support Team`,
            html: `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Invest Up - Response to Your Message</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
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

    .message-box {
      background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
      border-left: 4px solid #1e3a8a;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }

    .message-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e3a8a;
      margin: 0 0 10px 0;
    }

    .message-content {
      font-size: 14px;
      color: #4a5568;
      margin: 0;
      line-height: 1.6;
    }

    .response-box {
      background: linear-gradient(135deg, #f0fff4 0%, #dcfce7 100%);
      border-left: 4px solid #1e3a8a;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }

    .response-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e3a8a;
      margin: 0 0 15px 0;
    }

    .response-content {
      font-size: 14px;
      color: #4a5568;
      margin: 0;
      line-height: 1.6;
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
      margin: 40px 0;
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
      
      .email-footer {
        padding: 25px 20px;
      }
    }
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
                <h1 class="brand-name">INVEST UP</h1>
                <p class="brand-tagline">Your Gateway to Smart Investments</p>
              </td>
            </tr>
            <tr>
              <td class="email-content">
                <h2 class="email-title">Response to Your Message</h2>
                <p class="email-greeting">Hello ${message.name}! 💬</p>
                <p class="email-body">
                  Thank you for contacting <span class="highlight">Invest Up</span> support. We've reviewed your message 
                  and have the following response for you.
                </p>
                
                <div class="message-box">
                  <div class="message-title">📝 Your Original Message</div>
                  <div class="message-content">${message.message.replace(/\n/g, '<br>')}</div>
                </div>
                
                <div class="response-box">
                  <div class="response-title">💬 Our Response</div>
                  <div class="response-content">${reply.replace(/\n/g, '<br>')}</div>
                </div>
                
                <p class="email-body">
                  If you have any further questions or need additional assistance, please don't hesitate to contact us again. 
                  We're here to help you with all your investment needs.
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
            `
        };

        try {
            console.log('SMTP configuration for reply:', {
                host: process.env.SMTP_HOST || 'indra.vivawebhost.com',
                port: process.env.SMTP_PORT || '465',
                user: process.env.SMTP_USER,
                sender: process.env.SENDER_EMAIL,
                recipient: message.email
            });
            
            // Use the new saveToSentFolder method if available, otherwise fall back to regular sendMail
            let info;
            if (transporter.saveToSentFolder) {
                console.log('Using saveToSentFolder method...');
                info = await transporter.saveToSentFolder(mailOptions);
            } else {
                console.log('Using regular sendMail method...');
                info = await transporter.sendMail(mailOptions);
            }
            
            // Check if we're in preview mode (email not actually sent)
            if (info.preview) {
                console.log('Email in preview mode or SMTP connection failed. Message stored but email not sent.');
                
                // Return partial success since the reply was saved but email isn't sent in preview mode
                return res.json({ 
                    success: true, 
                    message: 'Reply saved but email delivery is in preview mode. The message will be available in the user\'s dashboard.',
                    emailSent: false,
                    emailError: 'SMTP server not available or in preview mode'
                });
            }
            
            console.log('Reply email sent successfully:', info.messageId);
            
            // Always return success since the reply was saved in the database
            return res.json({ 
                success: true, 
                message: 'Reply sent successfully',
                emailSent: true
            });
        } catch (emailError) {
            console.error('Failed to send reply email:', emailError);
            console.error('Email details:', {
                to: message.email,
                subject: mailOptions.subject,
                error: emailError.message,
                code: emailError.code
            });
            
            // Return partial success since the reply was saved but email failed
            return res.json({ 
                success: true, 
                message: 'Reply saved but could not be sent via email. User will see the reply when they log in.',
                emailSent: false,
                emailError: emailError.message
            });
        }
    } catch (error) {
        console.error('Error in replyToMessage:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}; 