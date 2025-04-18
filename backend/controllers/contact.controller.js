const { sendEmail } = require('../utils/email');
const { AppError } = require('../middleware/error.middleware');

exports.sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return next(new AppError('All fields are required', 400));
    }

    // Compose the email
    const mailSubject = `Contact Form: ${subject}`;
    const mailMessage = `
      You have received a new message from the contact form:
      Name: ${name}
      Email: ${email}
      Subject: ${subject}
      Message:
      ${message}
    `;

    await sendEmail({
      email: process.env.EMAIL_TO || process.env.EMAIL_USER, // your receiving email
      subject: mailSubject,
      message: mailMessage,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
      `
    });

    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    next(error);
  }
};