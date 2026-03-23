const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log(`📧 Attempting to send email to: ${options.email}`);
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    // Keep timeouts but be generous
    connectionTimeout: 15000, 
    greetingTimeout: 15000,
    socketTimeout: 15000
  });

  const mailOptions = {
    from: `"TechnoZone Support" <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Nodemailer Error for ${options.email}:`, error);
    throw error;
  }
};

module.exports = sendEmail;
