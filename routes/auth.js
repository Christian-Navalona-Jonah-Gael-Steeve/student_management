const express = require("express");
const router = express.Router();
const { User } = require("../model/schemas");
const {
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    validateToken,
    decryptToken,
    encryptPassword,
} = require("../utils/authUtils");
const { sendResetPasswordEmail } = require("../utils/mailUtils")
const { createError } = require("../utils/errorUtils");
const { protect } = require("../middlewares/authMiddleware");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Login route
router.post("/token", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            throw createError(400, "L'email et le mot de passe sont requis");
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            throw createError(401, "Identifiants invalides");
        }

        // Check if user is active
        if (!user.isActive) {
            throw createError(401, "Le compte est désactivé");
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw createError(401, "Identifiants invalides");
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Send response
        res.status(200).json({
            user: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        next(error);
    }
});

router.post("/verify", async (req, res, next) => {
    try {
        const { email } = req.body;

        // Validate input
        if (!email) {
            throw createError(400, "L'email est requis");
        }

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            throw createError(404, "Le compte n'existe pas!");
        }

        // Check if user is active
        if (!user.isVerified) {
            throw createError(401, "Le compte n'est pas encore vérifié!");
        }

        // Send response
        res.status(200).json({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        });
    } catch (error) {
        next(error);
    }
});

router.post("/send-mail", async (req, res, next) => {
    try {
        const { email } = req.body;

        // Validate input
        if (!email) {
            res.status(400).json({
                message:
                    "L'email de l'utilisateur est requis",
            });
        }

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            res.status(404).json({ message: "Le compte n'existe pas!" });
        }

        await sendResetPasswordEmail(user)

        // Send response
        res.status(200).json(null);
    } catch (error) {
        next(error);
    }
});

router.post("/validate", async (req, res, next) => {
    try {
        const { email, newPassword, validationToken } = req.body;

        // Validate input
        if (!validationToken) {
            throw createError(400, "Le token de validation est requis");
        }

        // Validate input
        if (!email || !newPassword) {
            throw createError(400, "L'email et le nouveau mot de passe sont requis");
        }

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            throw createError(401, "Le compte n'existe pas!");
        }

        // Check if user is active
        if (!user.isActive) {
            throw createError(401, "Le compte est désactivé");
        }

        // Check if user is active
        if (user.isVerified) {
            res.status(200).json({ message: "Le compte est déjà vérifié!" });
        }

        const newHashedPassword = await encryptPassword(newPassword);
        user.password = newHashedPassword;
        user.isVerified = true;
        await user.save();

        // Send response
        res.status(200).json({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        });
    } catch (error) {
        next(error);
    }
});

router.post("/reset-password", async (req, res, next) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        // Validate input
        if (!email && !oldPassword && !newPassword) {
            res.status(400).json({
                message:
                    "L'email, l'ancien mot de passe et le nouveau mot de passe sont requis",
            });
        }

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            res.status(404).json({ message: "Le compte n'existe pas!" });
        }

        if (!comparePassword(oldPassword, user.password)) {
            res.status(401).json({ message: "L'ancien mot de passe est incorrect" });
        }

        const newHashedPassword = encryptPassword(newPassword);
        user.password = newHashedPassword;
        await user.save();

        // Send response
        res.status(200).json({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        });
    } catch (error) {
        next(error);
    }
});

// Refresh token route
router.post("/refresh", async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw createError(400, "Le token de rafraîchissement est requis");
        }

        // Validate refresh token
        const tokenValidation = validateToken(refreshToken, true);
        if (!tokenValidation.valid) {
            throw createError(401, "Token de rafraîchissement invalide");
        }

        // Find user
        const user = await User.findById(tokenValidation.decoded.userId);
        if (!user || !user.isActive) {
            throw createError(401, "Utilisateur non trouvé ou inactif");
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken(user);

        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: refreshToken,
        });
    } catch (error) {
        next(error);
    }
});

// Get current user route
router.get("/me", protect, async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        const result = decryptToken(token);
        if (!result.success) {
            res.status(401).json({ message: result.error });
        }
        const data = result.data;
        const user = await User.findById(data.userId).select("-password");
        if (!user) {
            throw createError(404, "Utilisateur non trouvé");
        }

        res.status(200).json({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        });
    } catch (error) {
        next(error);
    }
});

router.post('/google', async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, sub: googleSub } = payload;

        let user = await User.findOne({ email });

        if (user) {
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            return res.status(200).json({
                user: {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            });
        }

        user = await User.findOne({ googleSub });

        if (user) {
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            return res.status(200).json({
                user: {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            });
        }

        // If no match found, return error
        return res.status(404).json({
            message: `Aucun compte n'est lié à ce compte Google`,
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ message: 'Token Google non valide' });
    }
});

module.exports = router;
