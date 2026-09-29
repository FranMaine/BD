require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');

const { connectMongo } = require('./config/mongo');

const indexRouter = require('./routes/index');
const searchRouter = require('./routes/search');
const moviesRouter = require('./routes/movies');
const peopleRouter = require('./routes/people');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const reviewsRouter = require('./routes/reviews');
const { attachUser, attachFlash } = require('./middleware/auth');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'movieweb_secret',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 8 },
    })
);
app.use(attachUser);
app.use(attachFlash);

app.use('/', indexRouter);
app.use('/', searchRouter);
app.use('/', moviesRouter);
app.use('/', peopleRouter);
app.use('/', authRouter);
app.use('/', usersRouter);
app.use('/', reviewsRouter);

app.use((req, res) => {
    res.status(404).render('404', { title: 'Pagina no encontrada' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render('error', { title: 'Error', message: err.message });
});

const PORT = process.env.PORT || 3000;

async function start() {
    await connectMongo();
    app.listen(PORT, () => {
        console.log(`MovieWeb corriendo en http://localhost:${PORT}`);
    });
}

start().catch((err) => {
    console.error('No se pudo iniciar la aplicacion:', err);
    process.exit(1);
});
