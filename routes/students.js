const express = require('express');
const router = express.Router();
const { Student, User } = require("../model/schemas");
const { generatePassword, encryptPassword } = require("../utils/authUtils");
const { toStudentDto } = require('../utils/dtoUtils');

// Get all students
router.get('/', (req, res) => {
    Student.find()
        .then((students) => {
            res.send(students.map(toStudentDto));
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la récupération des étudiants" });
        });
});

// Get student by ID
router.get('/:id', (req, res) => {
    Student.findById(req.params.id)
        .then((student) => {
            if (!student) {
                return res.status(404).json({ message: "Étudiant non trouvé" });
            }
            res.send(toStudentDto(student));
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la récupération de l'étudiant" });
        });
});

// Create a new student
router.post('/', async (req, res) => {
    const { firstName, lastName, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (!!existingUser) {
        return res.status(400).json({ message: "L'email est déjà utilisé" });
    }

    // Hash password
    const hashedPassword = await encryptPassword(generatePassword());

    // Create Student (with discriminator key automatically set)
    const student = await Student.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
    });

    res.status(201).json(toStudentDto(student));
});

// Update a student
router.put('/:id', (req, res) => {
    Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .then((student) => {
            if (!student) {
                return res.status(404).json({ message: "Étudiant non trouvé" });
            }
            res.json(toStudentDto(student));
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la mise à jour de l'étudiant" });
        });
});

// Delete a student
router.delete('/:id', (req, res) => {
    Student.findByIdAndDelete(req.params.id)
        .then((student) => {
            if (!student) {
                return res.status(404).json({ message: "Étudiant non trouvé" });
            }
            res.json({ message: `Étudiant supprimé avec l'ID ${student._id}!` });
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la suppression de l'étudiant" });
        });
});

module.exports = router;