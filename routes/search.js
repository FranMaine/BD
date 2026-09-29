const express = require('express');
const router = express.Router();
const moviesModel = require('../models/moviesModel');

// Busqueda general: peliculas, actores y directores en simultaneo.
router.get('/buscar', async (req, res, next) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) return res.redirect('/');
        const results = await moviesModel.searchAll(q);
        res.render('resultado', { title: `Resultados para "${q}"`, q, results });
    } catch (err) {
        next(err);
    }
});

// Formulario de busqueda por palabra clave.
router.get('/keyword', (req, res) => {
    res.render('search_keyword', { title: 'Buscar por palabra clave' });
});

// Resultados de busqueda por palabra clave.
router.get('/keyword/resultados', async (req, res, next) => {
    try {
        const kw = (req.query.kw || '').trim();
        if (!kw) return res.redirect('/keyword');
        const movies = await moviesModel.searchByKeyword(kw);
        res.render('resultados_keyword', { title: `Peliculas con "${kw}"`, kw, movies });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
