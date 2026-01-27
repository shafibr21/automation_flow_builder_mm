import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
let transporter = null;

async function getTransporter() {
    if (transporter) {
        return transporter;
    }

    // For development, use Ethereal email (test account)
    // For production, use real SMTP credentials
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
        // Create test account automatically
        const testAccount = await nodemailer.createTestAccount();

        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });

        console.log('📧 Using Ethereal test email account');
        console.log('   User:', testAccount.user);
        console.log('   Pass:', testAccount.pass);
    } else {
        const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
        const port = parseInt(process.env.SMTP_PORT) || 587;
        const secure = (process.env.SMTP_SECURITY === 'true');

        transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            logger: false,
            debug: false
        });

        console.log(`📧 Using SMTP: host=${host} port=${port} secure=${secure} user=${process.env.SMTP_USER ? process.env.SMTP_USER.replace(/(.{3}).+@/, '$1***@') : ''}`);
    }

    return transporter;
}

/**
 * Send email using configured SMTP
 * @param {string} to - Recipient email address
 * @param {string} message - Email message content
 * @returns {Promise<string>} Message ID
 */
export async function sendEmail(to, message) {
    try {
        const transport = await getTransporter();

                const fromAddress = process.env.SMTP_USER ? `"Automation Flow Builder" <${process.env.SMTP_USER}>` : '"Automation Flow Builder" <noreply@automation.com>';

                const info = await transport.sendMail({
                        from: fromAddress,
                        to,
                        subject: 'Automation Test Email',
                        text: message,
                        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Automation Test Email</h2>
                <p>${message}</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                <p style="color: #666; font-size: 12px;">
                    This email was sent by the Automation Flow Builder test execution.
                </p>
            </div>`
                });

                // Log entire info for debugging (do not leak in production logs)
                console.log('📧 Mailer sendMail info:', info);

        // For Ethereal, log the preview URL
        if (process.env.NODE_ENV === 'development') {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            if (previewUrl) {
                console.log('📧 Email preview URL:', previewUrl);
            }
        }

        return info.messageId;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}
