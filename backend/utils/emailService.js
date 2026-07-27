/**
 * Email Service using Nodemailer
 * Sends email notifications for placement events
 */

const nodemailer = require('nodemailer');

// Email configuration
const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
};

// Create transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(EMAIL_CONFIG);
  }
  return transporter;
}

/**
 * Send email notification
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Email plain text content
 * @param {string} options.userId - User ID to check notification preferences (optional)
 */
async function sendEmail({ to, subject, html, text, userId }) {
  try {
    // Check if user has email notifications enabled (if userId provided)
    if (userId) {
      const User = require('../models/User');
      const user = await User.findById(userId).select('emailNotifications');
      if (user && user.emailNotifications === false) {
        console.log(`📧 Email notifications disabled for user ${userId}`);
        return { success: true, message: 'Email notifications disabled by user' };
      }
    }

    // Check if email is configured
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
      console.log('📧 Email not configured. Would send email to:', to);
      console.log('Subject:', subject);
      console.log('Content:', text || html);
      return { success: true, message: 'Email simulation (not configured)' };
    }

    const mailOptions = {
      from: `"Smart Campus Placement" <${EMAIL_CONFIG.auth.user}>`,
      to,
      subject,
      text,
      html
    };

    const info = await getTransporter().sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send student selection email
 */
async function sendSelectionEmail(studentEmail, studentName, companyName, jobRole, packageOffered) {
  const subject = `🎉 Congratulations! Selected at ${companyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">🎊 Congratulations ${studentName}!</h2>
      <p>We are thrilled to inform you that you have been <strong>SELECTED</strong> for the following position:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Position:</strong> ${jobRole}</p>
        <p><strong>Package:</strong> Rs. ${packageOffered} LPA</p>
      </div>
      <p>This is a significant achievement and we are proud of your success!</p>
      <p>Further details will be shared by the placement cell soon.</p>
      <p style="margin-top: 30px;">Best wishes,<br><strong>Placement Cell Team</strong></p>
    </div>
  `;
  const text = `Congratulations ${studentName}! You have been selected at ${companyName} for ${jobRole} position with package Rs. ${packageOffered} LPA.`;
  
  return sendEmail({ to: studentEmail, subject, html, text });
}

/**
 * Send student shortlist email
 */
async function sendShortlistEmail(studentEmail, studentName, companyName, jobRole) {
  const subject = `✨ Shortlisted for ${companyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">✨ Great News ${studentName}!</h2>
      <p>You have been <strong>SHORTLISTED</strong> for the following position:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Position:</strong> ${jobRole}</p>
      </div>
      <p>Please prepare for the next round of interviews. Check your dashboard for updates.</p>
      <p style="margin-top: 30px;">Best wishes,<br><strong>Placement Cell Team</strong></p>
    </div>
  `;
  const text = `Congratulations ${studentName}! You have been shortlisted for ${jobRole} position at ${companyName}.`;
  
  return sendEmail({ to: studentEmail, subject, html, text });
}

/**
 * Send HR new application email
 */
async function sendNewApplicationEmail(hrEmail, hrName, studentName, jobRole, skillMatch) {
  const subject = `📋 New Application Received - ${studentName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">📋 New Application</h2>
      <p>Hello ${hrName},</p>
      <p>A new student has applied for your job opening:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Student:</strong> ${studentName}</p>
        <p><strong>Position:</strong> ${jobRole}</p>
        <p><strong>Skill Match:</strong> ${skillMatch}%</p>
      </div>
      <p>Please review the application in your HR dashboard.</p>
      <p style="margin-top: 30px;">Regards,<br><strong>Smart Campus Placement System</strong></p>
    </div>
  `;
  const text = `New application from ${studentName} for ${jobRole} position. Skill match: ${skillMatch}%.`;
  
  return sendEmail({ to: hrEmail, subject, html, text });
}

/**
 * Send admin placement notification email
 */
async function sendAdminPlacementEmail(adminEmail, studentName, companyName, jobRole, packageOffered) {
  const subject = `🎉 Student Placed - ${studentName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">🎉 New Placement!</h2>
      <p>A student has been successfully placed:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Student:</strong> ${studentName}</p>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Position:</strong> ${jobRole}</p>
        <p><strong>Package:</strong> Rs. ${packageOffered} LPA</p>
      </div>
      <p>View details in the admin dashboard.</p>
      <p style="margin-top: 30px;">Regards,<br><strong>Smart Campus Placement System</strong></p>
    </div>
  `;
  const text = `${studentName} placed at ${companyName} for ${jobRole} - Rs. ${packageOffered} LPA.`;
  
  return sendEmail({ to: adminEmail, subject, html, text });
}

/**
 * Send interview schedule email
 */
async function sendInterviewScheduleEmail(studentEmail, studentName, companyName, interviewDate, interviewTime, venue) {
  const subject = `📅 Interview Scheduled - ${companyName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8b5cf6;">📅 Interview Scheduled</h2>
      <p>Hello ${studentName},</p>
      <p>Your interview has been scheduled:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Date:</strong> ${interviewDate}</p>
        <p><strong>Time:</strong> ${interviewTime}</p>
        <p><strong>Venue:</strong> ${venue}</p>
      </div>
      <p>Please be on time and well-prepared. Good luck!</p>
      <p style="margin-top: 30px;">Best wishes,<br><strong>Placement Cell Team</strong></p>
    </div>
  `;
  const text = `Interview scheduled at ${companyName} on ${interviewDate} at ${interviewTime}. Venue: ${venue}`;
  
  return sendEmail({ to: studentEmail, subject, html, text });
}

/**
 * Send document verification email
 */
async function sendDocumentVerificationEmail(studentEmail, studentName, status, remarks) {
  const isApproved = status === 'verified';
  const subject = isApproved ? '✅ Documents Verified' : '⚠️ Document Verification Required';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${isApproved ? '#10b981' : '#f59e0b'};">${isApproved ? '✅' : '⚠️'} Document Verification Update</h2>
      <p>Hello ${studentName},</p>
      <p>Your uploaded documents have been reviewed:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Status:</strong> ${isApproved ? 'Verified ✅' : 'Needs Correction ⚠️'}</p>
        ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ''}
      </div>
      ${!isApproved ? '<p>Please update your documents and resubmit.</p>' : '<p>You are all set for placements!</p>'}
      <p style="margin-top: 30px;">Regards,<br><strong>Placement Cell Team</strong></p>
    </div>
  `;
  const text = `Document verification ${status}. ${remarks || ''}`;
  
  return sendEmail({ to: studentEmail, subject, html, text });
}

/**
 * Send offer letter email to student
 */
async function sendOfferLetterEmail(studentEmail, studentName, companyName, jobRole, packageOffered) {
  const subject = `🎉 Offer Letter from ${companyName} - ${jobRole}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Congratulations!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">You have received an Offer Letter</p>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px;">Dear <strong>${studentName}</strong>,</p>
        <p>We are delighted to inform you that <strong>${companyName}</strong> has issued you an official offer letter for the following position:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
          <p style="margin: 6px 0;"><strong>🏢 Company:</strong> ${companyName}</p>
          <p style="margin: 6px 0;"><strong>💼 Position:</strong> ${jobRole}</p>
          <p style="margin: 6px 0;"><strong>💰 Package:</strong> Rs. ${packageOffered} LPA</p>
        </div>
        <p>To download your offer letter, please log in to the <strong>Smart Campus PlaceHub</strong> portal and go to <strong>My Applications</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://smart-campus-placehub.vercel.app/student/applications" 
             style="background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View My Applications →
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This is an automated notification from Smart Campus PlaceHub.</p>
      </div>
    </div>
  `;
  const text = `Congratulations ${studentName}! You have received an offer letter from ${companyName} for ${jobRole} at Rs. ${packageOffered} LPA. Login to Smart Campus PlaceHub to download it.`;

  return sendEmail({ to: studentEmail, subject, html, text });
}

module.exports = {
  sendEmail,
  sendSelectionEmail,
  sendShortlistEmail,
  sendNewApplicationEmail,
  sendAdminPlacementEmail,
  sendInterviewScheduleEmail,
  sendDocumentVerificationEmail,
  sendOfferLetterEmail
};
