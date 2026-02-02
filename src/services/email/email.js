// services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.test' });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// to: email address of receiver
// subject: subject of the email
// html: email content
async function sendEmail({ to, subject, html, attachments = [] }) {
    return await transporter.sendMail({
        from: `"SP Merch Store" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        attachments
    });
}

module.exports = { sendEmail };
