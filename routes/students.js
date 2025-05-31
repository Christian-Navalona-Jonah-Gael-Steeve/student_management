const { Student, User } = require("../model/schemas");
const { generatePassword, encryptPassword } = require("../utils/authUtils");
const { toStudentDto } = require('../utils/dtoUtils')

function getAll(req, res) {
    Student.find()
        .then((students) => {
            res.send(students.map(toStudentDto));
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la récupération des étudiants" });
        });
}

function getStudentById(req, res) {
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
}

async function create(req, res) {
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
}

function update(req, res) {
    Student.findByIdAndUpdate(req.params.id, req.body)
        .then((student) => {
            if (!student) {
                return res.status(404).json({ message: "Étudiant non trouvé" });
            }
            res.json(toStudentDto(student));
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la mise à jour de l'étudiant" });
        });
}

function deleteStudent(req, res) {
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
}

module.exports = { getAll, getStudentById, create, update, deleteStudent };
