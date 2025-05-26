const { User } = require("../model/schemas");
const { generatePassword, encryptPassword } = require("../utils/authUtils");
const { toUserDto } = require('../utils/dtoUtils');

function getAll(req, res) {
    User.find()
        .then((users) => {
            console.log(users);
            res.send(users.map(toUserDto));
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
        });
}

function getUserById(req, res) {
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
}

async function create(req, res) {
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
}

function update(req, res) {
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
}

function deleteUser(req, res) {
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
}

module.exports = { getAll, getUserById, create, update, deleteUser };