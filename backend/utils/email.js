const nodemailer = require('nodemailer');

exports.sendEmail = async (options) => {
  // Validate required environment variables
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email configuration missing. Check EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in .env');
    throw new Error('Email service not configured properly');
  }

  // Create Gmail-specific transporter
  let transporterConfig = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates
    },
    debug: process.env.NODE_ENV !== 'production', // Enable debug in non-production
    logger: process.env.NODE_ENV !== 'production', // Enable logging in non-production
  };

  // For Gmail specifically
  if (process.env.EMAIL_HOST.includes('gmail')) {
    console.log('Using Gmail-specific configuration');
    transporterConfig = {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: process.env.NODE_ENV !== 'production',
      logger: process.env.NODE_ENV !== 'production',
    };
  }

  const transporter = nodemailer.createTransport(transporterConfig);

  // Verify transporter configuration
  try {
    await transporter.verify();
    console.log('Email transporter verified successfully');
  } catch (error) {
    console.error('Email transporter verification failed:', error);
    throw new Error(`Email service connection failed: ${error.message}`);
  }

  // Define email options
  const mailOptions = {
    from: `${process.env.RESTAURANT_NAME} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}; 