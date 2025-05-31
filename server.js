require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const emailRoutes = require('./routes/email');
const userRoutes = require('./routes/users');
const studentRoutes = require('./routes/students');
const courseRoutes = require('./routes/courses');
const gradeRoutes = require('./routes/grades');
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
app.use(`${prefix}/users`, userRoutes)
app.use(`${prefix}/students`, studentRoutes)
app.use(`${prefix}/courses`, courseRoutes)
app.use(`${prefix}/grades`, gradeRoutes)

app.use(errorMiddleware)

app.listen(SERVER_PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${SERVER_PORT}`);
});

module.exports = app;
