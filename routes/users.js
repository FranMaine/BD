const express = require('express');
const router = express.Router();
const usersModel = require('../models/usersModel');
const moviesModel = require('../models/moviesModel');
const activityModel = require('../models/activityModel');
const { requireLogin, setFlash } = require('../middleware/auth');

router.get('/perfil', requireLogin, async (req, res, next) => {
    try {
        const userId = req.session.user.userId;
        const [favorites, watched, timeline] = await Promise.all([
            usersModel.getFavorites(userId),
            usersModel.getWatched(userId),
            activityModel.getUserTimeline(userId, 30),
        ]);
        res.render('perfil', { title: 'Mi perfil', favorites, watched, timeline });
    } catch (err) {
        next(err);
    }
});

// Alterna favorito y registra el evento en el timeline de MongoDB.
router.post('/favorito/:movieId', requireLogin, async (req, res, next) => {
    try {
        const userId = req.session.user.userId;
        const movieId = Number(req.params.movieId);
        const existing = await usersModel.getUserMovie(userId, movieId);
        const nextValue = !(existing && existing.is_favorite);
        await usersModel.upsertUserMovie(userId, movieId, { isFavorite: nextValue });

        if (nextValue) {
            const movie = await moviesModel.getById(movieId);
            await activityModel.logActivity(userId, 'ADDED_TO_FAVORITES', {
                movieId,
                movieTitle: movie?.title,
            });
            setFlash(req, 'Agregada a favoritos', 'success');
        } else {
            setFlash(req, 'Quitada de favoritos', 'default');
        }
        res.redirect(req.get('referer') || `/pelicula/${movieId}`);
    } catch (err) {
        next(err);
    }
});

// Marca como vista.
router.post('/vista/:movieId', requireLogin, async (req, res, next) => {
    try {
        const userId = req.session.user.userId;
        const movieId = Number(req.params.movieId);
        await usersModel.upsertUserMovie(userId, movieId, { isWatched: true });
        setFlash(req, 'Marcada como vista', 'success');
        res.redirect(req.get('referer') || `/pelicula/${movieId}`);
    } catch (err) {
        next(err);
    }
});

// Califica y opina brevemente sobre una pelicula (guardado en PostgreSQL).
router.post('/calificar/:movieId', requireLogin, async (req, res, next) => {
    try {
        const userId = req.session.user.userId;
        const movieId = Number(req.params.movieId);
        const { rating, review } = req.body;
        await usersModel.upsertUserMovie(userId, movieId, {
            isWatched: true,
            rating: rating ? Number(rating) : null,
            review: review || null,
        });

        const movie = await moviesModel.getById(movieId);
        await activityModel.logActivity(userId, 'RATED_MOVIE', {
            movieId,
            movieTitle: movie?.title,
            rating: Number(rating),
        });
        setFlash(req, 'Calificacion guardada', 'success');
        res.redirect(`/pelicula/${movieId}`);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
