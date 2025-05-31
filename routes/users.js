const express = require('express');
const router = express.Router();
const { User } = require("../model/schemas");
const { generatePassword, encryptPassword } = require("../utils/authUtils");
const { protect } = require("../middlewares/authMiddleware");
const { toUserDto } = require('../utils/dtoUtils');

// Get all users
router.get('/', (req, res) => {
    User.find()
        .then((users) => {
            res.send(users.map(toUserDto));
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
        });
});

// Get user by ID
router.get('/:id', (req, res) => {
    User.findById(req.params.id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }
            res.send(toUserDto(user));
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" });
        });
});

// Create a new user
router.post('/', async (req, res) => {
    const { firstName, lastName, email, role } = req.body;

    const existingUser = await User.findByEmail(email);
    if (!!existingUser) {
        return res.status(400).json({ message: "L'email est déjà utilisé" });
    }

    const hashedPassword = await encryptPassword(generatePassword());

    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
    });

    res.status(201).json(toUserDto(user));
});

// Update a user
router.put('/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }
            res.json(toUserDto(user));
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
        });
});

// Delete a user
router.delete('/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }
            res.json({ message: `Utilisateur supprimé avec l'ID ${user._id} !` });
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
        });
});

router.post('/link-google', protect, async (req, res, next) => {
    const { idToken } = req.body;

    try {
        let token = req.token
        const result = decryptToken(token);
        if (!result.success) {
            res.status(401).json({ message: result.error });
        }
        const data = result.data;
        // Validate input
        if (!idToken) {
            throw createError(400, "Le token Google est requis");
        }

        // Verify Google ID token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleSub } = payload;

        const user = await User.findById(data.userId);
        if (!user) {
            throw createError(404, "Le compte utilisateur n'existe pas");
        }

        // Check if the account is already linked
        if (user.googleSub) {
            return res.status(400).json({
                message: "Le compte utilisateur est déjà lié à un compte Google",
            });
        }

        // Link the Google account
        user.googleSub = googleSub;
        await user.save();

        res.status(200).json({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            googleSub: user.googleSub,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;