const express = require('express');
const router = express.Router();
const usersModel = require('../models/usersModel');
const { setFlash } = require('../middleware/auth');

router.get('/register', (req, res) => {
    res.render('register', { title: 'Crear cuenta', error: null });
});

router.post('/register', async (req, res, next) => {
    const { username, name, email, password } = req.body;
    try {
        if (!username || !name || !email || !password) {
            return res.render('register', { title: 'Crear cuenta', error: 'Todos los campos son obligatorios.' });
        }
        const existing = await usersModel.findByUsername(username);
        if (existing) {
            return res.render('register', { title: 'Crear cuenta', error: 'Ese nombre de usuario ya existe.' });
        }
        const user = await usersModel.createUser({ username, name, email, password });
        req.session.user = { userId: user.user_id, username: user.username, name: user.name };
        setFlash(req, `Bienvenido, ${user.name}`, 'success');
        res.redirect('/perfil');
    } catch (err) {
        next(err);
    }
});

router.get('/login', (req, res) => {
    res.render('login', { title: 'Iniciar sesion', error: null });
});

router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const user = await usersModel.findByUsername(username);
        const valid = user && (await usersModel.verifyPassword(user, password));
        if (!valid) {
            return res.render('login', { title: 'Iniciar sesion', error: 'Usuario o contraseña incorrectos.' });
        }
        req.session.user = { userId: user.user_id, username: user.username, name: user.name };
        const returnTo = req.session.returnTo || '/perfil';
        delete req.session.returnTo;
        setFlash(req, `Hola de nuevo, ${user.name}`, 'success');
        res.redirect(returnTo);
    } catch (err) {
        next(err);
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
