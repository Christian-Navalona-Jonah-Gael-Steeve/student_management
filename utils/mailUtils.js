const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Configure the email transporter for SMTP
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: process.env.MAIL_PORT || 587,
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

/**
 * Generates a link token with expiration.
 * @param {Object} user - User object containing user_id and email.
 * @param {number} expiresIn - Token expiration time in seconds.
 * @returns {string} - The generated token.
 */
function generateLinkToken(user, expiresIn = 15 * 60) {
    const secret = process.env.LINK_TOKEN_SECRET;
    return jwt.sign({ userId: user.user_id, email: user.email }, secret, { expiresIn });
}

/**
 * Sends a reset password email
 * @param {Object} user - User object containing user_id and email.
 * @param {number} lifetime - Link expiration time in minutes.
 */
async function sendResetPasswordEmail(user, lifetime = 15) {
    try {
        // Generate the reset token
        const token = generateLinkToken(user, lifetime * 60); // Convert minutes to seconds

        const appUrl = process.env.FRONTEND_URL;
        const resetLink = `${appUrl}/confirm-account?token=${token}`;


        const subject = 'Première connexion';
        const text = `Bienvenue dans notre système de gestion des étudiants MBDS. Vous devez définir un nouveau mot de passe pour votre compte afin de compléter votre première connexion.\n\nCliquez sur le lien ci-dessous pour renseigner votre nouveau mot de passe :\n\n${resetLink}\n\nCe lien expirera dans ${lifetime} minutes.\n\nSi aucun compte n'est lié à cette adresse mail, veuillez ignorer cet e-mail.`;
        const html = buildHtmlBody(resetLink, lifetime);

        await sendEmail(user.email, subject, text, html);
        console.log('Reset password email sent successfully.');
    } catch (error) {
        console.error('Error sending reset password email:', error);
    }
}

/**
 * Build Confirmation Email HTML Body
 * @param {string} link - Generated link.
 * @param {number} lifetime - Token lifetime in minutes.
 * @returns {string} - HTML content for the email.
 */
function buildHtmlBody(link, lifetime) {
    return `
        <!DOCTYPE html>
        <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://fonts.googleapis.com/css2?family=Alice&family=League+Spartan:wght@100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
                <title>Première connexion</title>
                <style>
                    body {
                        font-family: 'League Spartan', Arial, sans-serif;
                        background-color: #f9f9f9;
                        margin: 0;
                        padding: 20px;
                    }
                    .site-title {
                        color: #0097b2;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #333333;
                    }
                    p {
                        color: #555555;
                        line-height: 1.6;
                    }
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #007bff;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 4px;
                    }
                    .footer {
                        margin-top: 20px;
                        font-size: 12px;
                        color: #aaaaaa;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <h3>Première connexion</h3>
                    <p>Bienvenue dans notre système de gestion des étudiants MBDS. Vous devez définir un nouveau mot de passe pour votre compte afin de compléter votre première connexion.</p>
                    <p>Cliquez sur le lien ci-dessous pour renseigner votre nouveau mot de passe :</p>
                    <p><a href="${link}" class="button">Définir mon nouveau mot de passe</a></p>
                    <p>Ce lien expirera dans ${lifetime} minutes.</p>
                    <p>Si aucun compte n'est lié à cette adresse mail, veuillez ignorer cet e-mail.</p>
                    <div class="footer">
                        &copy; 2025 Student Management. Tous droits réservés.
                    </div>
                </div>
            </body>
        </html>`;
}

/**
 * Sends a generic email.
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Subject of the email.
 * @param {string} text - Plain text content of the email.
 * @param {string} html - HTML content of the email.
 */
async function sendEmail(to, subject, text, html) {
    const mailOptions = {
        from: process.env.MAIL_USER,
        to,
        subject,
        text,
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

module.exports = {
    sendEmail,
    sendResetPasswordEmail
};