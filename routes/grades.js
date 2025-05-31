const express = require('express');
const router = express.Router();
const { Grade } = require('../model/schemas');

// Get all grades
router.get('/', (req, res) => {
    Grade.find()
        .populate({ path: 'student', model: 'User' })
        .populate('course')
        .then((grades) => {
            res.send(grades);
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la récupération des notes", error: err.message });
        });
});

// Get grades by student ID
router.get('/:id', (req, res) => {
    Grade.find({ student: req.params.id })
        .populate({ path: 'student', model: 'User' })
        .populate('course')
        .then((grades) => {
            if (grades.length === 0) {
                return res.status(404).send({ message: 'Aucune note trouvée pour cet étudiant.' });
            }
            res.send(grades);
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la récupération des notes", error: err.message });
        });
});

// Create a new grade
router.post('/', (req, res) => {
    const grade = new Grade({
        student: req.body.student,
        course: req.body.course,
        grade: req.body.grade,
        date: req.body.date,
    });

    grade.save()
        .then((grade) => {
            res.status(201).json({ message: `Note enregistrée avec l'ID ${grade._id}!` });
        })
        .catch((err) => {
            res.status(400).json({ message: "Impossible d'enregistrer la note", error: err.message });
        });
});

// Update a grade
router.put('/:id', (req, res) => {
    Grade.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .then((grade) => {
            if (!grade) {
                return res.status(404).json({ message: "Note non trouvée" });
            }
            res.json({ message: `Note mise à jour avec l'ID ${grade._id}!` });
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la mise à jour de la note", error: err.message });
        });
});

// Delete a grade
router.delete('/:id', (req, res) => {
    Grade.findByIdAndDelete(req.params.id)
        .then((grade) => {
            if (!grade) {
                return res.status(404).json({ message: "Note non trouvée" });
            }
            res.json({ message: `Note supprimée avec l'ID ${grade._id}!` });
        })
        .catch((err) => {
            res.status(500).json({ message: "Erreur lors de la suppression de la note", error: err.message });
        });
});

module.exports = router;