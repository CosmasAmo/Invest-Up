export const EMAIL_VERIFY_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title>Invest Up - Email Verification</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: 'Open Sans', sans-serif;
      background: #F6FAFB;
      color: #333333;
    }

    table, td {
      border-collapse: collapse;
    }

    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .header {
      padding: 25px 0;
      text-align: center;
      background-color: #4C83EE;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    .logo {
      width: 150px;
      height: auto;
    }

    .main-content {
      padding: 40px 30px;
      color: #333333;
    }

    .footer {
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #666666;
      background-color: #f7f7f7;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    .button {
      display: inline-block;
      background: #22D172;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 30px;
      font-size: 16px;
      text-align: center;
      font-weight: bold;
      border-radius: 6px;
      margin: 20px 0;
    }

    .otp-container {
      margin: 20px 0;
      padding: 15px;
      background-color: #f7f7f7;
      border-radius: 6px;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      letter-spacing: 5px;
      color: #4C83EE;
    }

    .highlight {
      color: #4C83EE;
      font-weight: 600;
    }

    .divider {
      height: 1px;
      background-color: #eeeeee;
      margin: 20px 0;
    }

    @media only screen and (max-width: 480px) {
      .container {
        width: 95% !important;
      }
      
      .main-content {
        padding: 30px 20px !important;
      }
    }
  </style>
</head>

<body>
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center" style="padding: 40px 0;">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td class="header">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">INVEST UP</h1>
                </td>
              </tr>
              <tr>
                <td class="main-content">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 20px; font-size: 22px; line-height: 150%; font-weight: bold; color: #333333;">
                          Verify Your Email Address
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 20px; font-size: 16px; line-height: 150%;">
                          Hello,
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 20px; font-size: 16px; line-height: 150%;">
                          Thank you for registering with Invest Up. To complete your registration and access your account, please verify your email address: <span class="highlight">{{email}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 20px; font-size: 16px; line-height: 150%; font-weight: 600;">
                          Your verification code is:
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="otp-container">{{otp}}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 20px; font-size: 14px; line-height: 150%;">
                          This verification code is valid for 24 hours. If you did not request this verification, please ignore this email.
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="divider"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px 0 0; font-size: 14px; line-height: 150%;">
                          If you have any questions or need assistance, please contact our support team.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="footer">
                  <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Invest Up. All rights reserved.</p>
                  <p style="margin: 0;">This is an automated message, please do not reply to this email.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>

`

export const PASSWORD_RESET_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title>Invest Up - Password Reset</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: 'Open Sans', sans-serif;
      background: #F6FAFB;
      color: #333333;
    }

    table, td {
      border-collapse: collapse;
    }

    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .header {
      padding: 25px 0;
      text-align: center;
      background-color: #4C83EE;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    .logo {
      width: 150px;
      height: auto;
    }

    .main-content {
      padding: 40px 30px;
      color: #333333;
    }

    .footer {
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #666666;
      background-color: #f7f7f7;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    .button {
      display: inline-block;
      background: #22D172;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 30px;
      font-size: 16px;
      text-align: center;
      font-weight: bold;
      border-radius: 6px;
      margin: 20px 0;
    }

    .otp-container {
      margin: 20px 0;
      padding: 15px;
      background-color: #f7f7f7;
      border-radius: 6px;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      letter-spacing: 5px;
      color: #4C83EE;
    }

    .highlight {
      color: #4C83EE;
      font-weight: 600;
    }

    .divider {
      height: 1px;
      background-color: #eeeeee;
      margin: 20px 0;
    }

    @media only screen and (max-width: 480px) {
      .container {
        width: 95% !important;
      }
      
      .main-content {
        padding: 30px 20px !important;
      }
    }
  </style>
</head>

<body>
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center" style="padding: 40px 0;">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td class="header">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">INVEST UP</h1>
                </td>
              </tr>
              <tr>
                <td class="main-content">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 20px; font-size: 22px; line-height: 150%; font-weight: bold; color: #333333;">
                          Password Reset Request
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 20px; font-size: 16px; line-height: 150%;">
                          Hello,
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 20px; font-size: 16px; line-height: 150%;">
                          We received a request to reset the password for your Invest Up account: <span class="highlight">{{email}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 20px; font-size: 16px; line-height: 150%; font-weight: 600;">
                          Your password reset code is:
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="otp-container">{{otp}}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 20px; font-size: 14px; line-height: 150%;">
                          This code is valid for 15 minutes only. If you did not request a password reset, please ignore this email or contact our support team if you have concerns.
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="divider"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px 0 0; font-size: 14px; line-height: 150%;">
                          For security reasons, this email was sent to the email address associated with your Invest Up account.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="footer">
                  <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Invest Up. All rights reserved.</p>
                  <p style="margin: 0;">This is an automated message, please do not reply to this email.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`