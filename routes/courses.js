let { Course } = require('../model/schemas');

function getAll(req, res) {
    Course.find().then((classes) => {
        res.send(classes);
    }).catch((err) => {
        res.send(err);
    });
}


function create(req, res) {
    let course = new Course();
    course.name = req.body.name;
    course.code = req.body.code;

    course.save()
        .then((course) => {
            res.json({ message: `course saved with id ${course._id}!` });
        }
        ).catch((err) => {
            res.send('cant post course ', err);
        });
}

function update(req, res) {
    Course.findByIdAndUpdate(req.params.id, req.body).then((course) => {
        res.json({ message: `course updated with id ${course._id}!` });
    }).catch((err) => {
        res.send('cant update course ', err);
    });
}

function deleteCourse(req, res) {
    Course.findByIdAndDelete(req.params.id).then((course) => {
        res.json({ message: `course deleted with id ${course._id}!` });
    }).catch((err) => {
        res.send('cant delete course ', err);
    });
}


module.exports = { getAll, create, deleteCourse, update };
