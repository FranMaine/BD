const express = require('express');
const router = express.Router();
const moviesModel = require('../models/moviesModel');
const usersModel = require('../models/usersModel');
const reviewsModel = require('../models/reviewsModel');
const tmdbService = require('../services/tmdbService');

router.get('/pelicula/:id', async (req, res, next) => {
    try {
        const movieId = Number(req.params.id);
        const movie = await moviesModel.getById(movieId);
        if (!movie) return res.status(404).render('404', { title: 'No encontrado' });

        const [directors, cast, keywords, avgRating, reviews, tmdbData] = await Promise.all([
            moviesModel.getDirectorsForMovie(movieId),
            moviesModel.getCastForMovie(movieId),
            moviesModel.getKeywordsForMovie(movieId),
            moviesModel.getAverageRating(movieId),
            reviewsModel.getReviewsByMovie(movieId),
            movie.tmdb_id ? tmdbService.getMovieDetails(movie.tmdb_id) : null,
        ]);

        let userMovie = null;
        if (req.session.user) {
            userMovie = await usersModel.getUserMovie(req.session.user.userId, movieId);
        }

        res.render('pelicula', {
            title: movie.title,
            movie,
            directors,
            cast,
            keywords,
            avgRating,
            reviews,
            tmdbData,
            userMovie,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
