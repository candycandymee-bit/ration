const nodemailer = require('nodemailer');

// Add connection verification
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // Add debug information
  debug: true,
  logger: true
});

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log('Email transporter verification failed:', error);
  } else {
    console.log('Email transporter is ready to send messages');
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER ? 'Set' : 'Not Set'
    });
  }
});

const sendNotificationEmail = async (to, subject, message) => {
  try {
    console.log('Attempting to send email...', { to, subject });
    
    if (!process.env.SMTP_USER) {
      console.log('Email service not configured, skipping email notification');
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2b6777;">Ration Track Notification</h2>
          <p>${message}</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            This is an automated message from Ration Track System.
          </p>
        </div>
      `
    };

    console.log('Mail options:', { 
      from: mailOptions.from, 
      to: mailOptions.to,
      subject: mailOptions.subject 
    });

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    console.log(`Email sent to ${to}: ${subject}`);
    
    return result;
  } catch (error) {
    console.error('Email sending failed with error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error; // Re-throw to handle in the calling function
  }
};

module.exports = {
  sendNotificationEmail
};