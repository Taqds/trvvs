const nodemailer = require("nodemailer");

const sendToken = async (email, subject, text) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) throw new Error('SMTP credentials are not configured');
        const transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE || 'hotmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: subject,
            text: text,
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.error('Email delivery failed:', error.message);
        throw new Error('Email delivery failed');
    }
}

module.exports = sendToken;
