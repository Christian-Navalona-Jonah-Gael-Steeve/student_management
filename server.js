require('dotenv').config();
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let student = require('./routes/students');
let course = require('./routes/courses');
let grade = require('./routes/grades');
let user = require('./routes/users');
let process = require('process');
const { protect } = require('./middlewares/authMiddleware')
const errorMiddleware = require('./middlewares/errorMiddleware')
const authRoutes = require('./routes/auth')
let cors = require('cors');

app.use(cors({
    origin: true,
    credentials: true,
    exposedHeaders: ["token"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
}));

let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//mongoose.set('debug', true);

// TODO remplacer toute cette chaine par l'URI de connexion à votre propre base dans le cloud
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/student_db';
console.log("ACCESS_TOKEN_SECRET", process.env.ACCESS_TOKEN_SECRET)
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose.connect(uri, options)
    .then(() => {
        console.log("Connexion à la base mongo OK");
    },
        err => {
            console.log('Erreur de connexion: ', err);
        });

// Pour accepter les connexions cross-domain (CORS)
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

// Pour les formulaires
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let port = process.env.PORT || 8010;

// les routes
const prefix = '/api';



app.use(prefix + '/auth', authRoutes)

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

// On démarre le serveur
app.listen(port, "0.0.0.0");
console.log('Serveur démarré sur http://localhost:' + port);

module.exports = app;
