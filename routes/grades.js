let { Grade } = require('../model/schemas');

function getAll(req, res) {
    Grade.find()
        .populate('student')
        .populate('course')
        .then((grades) => {
            res.send(grades);
        }).catch((err) => {
            res.send(err);
        });
}

function getGradesByStudent(req, res) {
    Grade.find({ student: req.params.id })
        .populate('student')
        .populate('course')
        .then((grades) => {
            res.send(grades);
        }).catch((err) => {
            res.send(err);
        });
}


function create(req, res) {
    let grade = new Grade();

    grade.student = req.body.student;
    grade.course = req.body.course;
    grade.grade = req.body.grade;
    grade.date = req.body.date;

    grade.save()
        .then((grade) => {
            res.json({ message: `grade saved with id ${grade._id}!` });
        }
        ).catch((err) => {
            console.log(err);
            res.status(400).send('cant post grade ', err.message);
        });
}

function update(req, res) {
    Grade.findByIdAndUpdate(req.params.id, req.body).then((grade) => {
        res.json({ message: `grade updated with id ${grade._id}!` });
    }).catch((err) => {
        res.send('cant update grade ', err);
    });
}

function deleteGrade(req, res) {
    Grade.findByIdAndDelete(req.params.id).then((grade) => {
        res.json({ message: `grade deleted with id ${grade._id}!` });
    }).catch((err) => {
        res.send('cant delete grade ', err);
    });
}

module.exports = { getAll, getGradesByStudent, create, update, deleteGrade };
