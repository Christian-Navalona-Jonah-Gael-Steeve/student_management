let { Student } = require('../model/schemas');

function getAll(req, res) {
    Student.find().then((students) => {
        res.send(students);
    }).catch((err) => {
        res.send(err);
    });
}

function getStudentById(req, res) {
    Student.findById(req.params.id).then((student) => {
        res.send(student);
    }).catch((err) => {
        res.send(err);
    });
}


function create(req, res) {
    let student = new Student();
    student.firstName = req.body.firstName;
    student.lastName = req.body.lastName;
    student.mail = req.body.mail;

    student.save()
        .then((student) => {
            res.json({ message: `student saved with id ${student.id}!` });
        }
        ).catch((err) => {
            res.send('cant post student ', err);
        });
}

function update(req, res) {
    Student.findByIdAndUpdate(req.params.id, req.body).then((student) => {
        res.json({ message: `student updated with id ${student.id}!` });
    }).catch((err) => {
        res.send('cant update student ', err);
    });
}

function deleteStudent(req, res) {
    Student.findByIdAndDelete(req.params.id).then((student) => {
        res.json({ message: `student deleted with id ${student.id}!` });
    }).catch((err) => {
        res.send('cant delete student ', err);
    });
}

module.exports = { getAll, getStudentById, create, update, deleteStudent };
