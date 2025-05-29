const express = require('express');
const { sendEmail } = require('../utils/mailUtils'); // Import sendEmail from mailUtils.js

const router = express.Router();

/**
 * POST /send-email
 * Route to send an email using the sendEmail function.
 * Expects `to`, `subject`, `text`, and `html` in the request body.
 */
router.post('/send-email', async (req, res) => {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || !text || !html) {
        return res.status(400).json({ error: 'Missing required fields: to, subject, text, html' });
    }

    try {
        await sendEmail(to, subject, text, html);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

module.exports = router;