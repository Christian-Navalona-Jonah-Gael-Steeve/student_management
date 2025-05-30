require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const student = require('./routes/students');
const course = require('./routes/courses');
const grade = require('./routes/grades');
const emailRoutes = require('./routes/email');
const user = require('./routes/users');
const process = require('process');
const { protect } = require('./middlewares/authMiddleware')
const errorMiddleware = require('./middlewares/errorMiddleware')
const authRoutes = require('./routes/auth')
const db = require('./database/db');
const corsConfig = require('./config/corsConfig');
const cors = require('cors');

const app = express();

// Connect to database
db.connectDB();

// Middlewares
app.use(cors(corsConfig));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const SERVER_PORT = process.env.PORT || 8010;

const prefix = '/api';

// Routes
app.use(`${prefix}/auth`, authRoutes)
app.use(`${prefix}/mail`, emailRoutes)

app.route(prefix + '/students')
    .get(student.getAll)
    .post(student.create)

app.route(prefix + '/students/:id')
    .get(student.getStudentById)
    .put(student.update)
    .delete(student.deleteStudent);

app.route(prefix + '/courses')
    .get(course.getAll)
    .post(course.create)

app.route(prefix + '/courses/:id')
    .put(course.update)
    .delete(course.deleteCourse);

app.route(prefix + '/grades')
    .get(grade.getAll)
    .post(grade.create)

app.route(prefix + '/grades/:id')
    .get(grade.getGradesByStudent)
    .put(grade.update)
    .delete(grade.deleteGrade);

app.route(prefix + '/users')
    .get(user.getAll)
    .post(user.create)

app.route(prefix + '/users/:id')
    .get(user.getUserById)
    .put(user.update)
    .delete(user.deleteUser);

app.use(errorMiddleware)

app.listen(SERVER_PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${SERVER_PORT}`);
});

module.exports = app;
