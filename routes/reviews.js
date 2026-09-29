const express = require('express');
const router = express.Router();
const reviewsModel = require('../models/reviewsModel');
const activityModel = require('../models/activityModel');
const moviesModel = require('../models/moviesModel');
const { requireLogin, setFlash } = require('../middleware/auth');

// Crear una reseña extendida (MongoDB) para una pelicula.
router.post('/pelicula/:movieId/resenas', requireLogin, async (req, res, next) => {
    try {
        const movieId = Number(req.params.movieId);
        const { rating, text, tags } = req.body;
        const movie = await moviesModel.getById(movieId);
        if (!movie) return res.status(404).render('404', { title: 'No encontrado' });

        const review = await reviewsModel.createReview({
            userId: req.session.user.userId,
            username: req.session.user.username,
            movieId,
            movieTitle: movie.title,
            rating,
            text,
            tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        });

        await activityModel.logActivity(req.session.user.userId, 'WROTE_REVIEW', {
            movieId,
            movieTitle: movie.title,
            reviewId: String(review._id),
        });

        setFlash(req, 'Reseña publicada', 'success');
        res.redirect(`/pelicula/${movieId}`);
    } catch (err) {
        next(err);
    }
});

// Buscar reseñas (por texto libre, pelicula o usuario).
router.get('/resenas/buscar', async (req, res, next) => {
    try {
        const { text, movieId, userId } = req.query;
        const reviews = await reviewsModel.searchReviews({ text, movieId, userId });
        res.render('resenas_busqueda', { title: 'Buscar reseñas', reviews, query: req.query });
    } catch (err) {
        next(err);
    }
});

// Actualizar una reseña propia.
router.post('/resenas/:id/editar', requireLogin, async (req, res, next) => {
    try {
        const { text, rating, tags } = req.body;
        const updated = await reviewsModel.updateReview(req.params.id, req.session.user.userId, {
            text,
            rating: rating ? Number(rating) : undefined,
            tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
        });
        const review = updated || (await reviewsModel.getReviewById(req.params.id));
        setFlash(req, 'Reseña actualizada', 'success');
        res.redirect(`/pelicula/${review.movieId}`);
    } catch (err) {
        next(err);
    }
});

// Borrar una reseña propia.
router.post('/resenas/:id/borrar', requireLogin, async (req, res, next) => {
    try {
        const review = await reviewsModel.getReviewById(req.params.id);
        await reviewsModel.deleteReview(req.params.id, req.session.user.userId);
        setFlash(req, 'Reseña eliminada', 'default');
        res.redirect(review ? `/pelicula/${review.movieId}` : '/');
    } catch (err) {
        next(err);
    }
});

module.exports = router;
