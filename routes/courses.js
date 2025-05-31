const express = require('express');
const router = express.Router();
const { Course } = require('../model/schemas');

// Get all courses
router.get('/', (req, res) => {
    Course.find()
        .then((courses) => {
            res.send(courses);
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la récupération des cours" });
        });
});

// Create a new course
router.post('/', (req, res) => {
    const course = new Course({
        name: req.body.name,
        code: req.body.code,
    });

    course.save()
        .then((course) => {
            res.status(201).json({ message: `Cours enregistré avec l'ID ${course._id}!` });
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de l'enregistrement du cours" });
        });
});

// Update a course
router.put('/:id', (req, res) => {
    Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .then((course) => {
            if (!course) {
                return res.status(404).json({ message: "Cours non trouvé" });
            }
            res.json({ message: `Cours mis à jour avec l'ID ${course._id}!` });
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la mise à jour du cours" });
        });
});

// Delete a course
router.delete('/:id', (req, res) => {
    Course.findByIdAndDelete(req.params.id)
        .then((course) => {
            if (!course) {
                return res.status(404).json({ message: "Cours non trouvé" });
            }
            res.json({ message: `Cours supprimé avec l'ID ${course._id}!` });
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la suppression du cours" });
        });
});

module.exports = router;