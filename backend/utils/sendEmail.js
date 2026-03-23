const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 're_HyEWNgaD_2a8pyamRtx6VoCUtgX75VRMu');

const sendEmail = async (options) => {
  console.log(`📧 Attempting to send email via Resend to: ${options.email}`);
  
  try {
    const data = await resend.emails.send({
      from: 'TechnoZone <onboarding@resend.dev>',
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.message
    });
    
    console.log(`✅ Email sent successfully via Resend: ${data.id}`);
    return data;
  } catch (error) {
    console.error(`❌ Resend Error for ${options.email}:`, error);
    throw error;
  }
};

module.exports = sendEmail;
