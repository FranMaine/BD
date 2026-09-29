const express = require('express');
const router = express.Router();
const peopleModel = require('../models/peopleModel');
const moviesModel = require('../models/moviesModel');
const tmdbService = require('../services/tmdbService');

router.get('/actor/:id', async (req, res, next) => {
    try {
        const actorId = Number(req.params.id);
        const actor = await peopleModel.getActorById(actorId);
        if (!actor) return res.status(404).render('404', { title: 'No encontrado' });

        const [movies, tmdbData] = await Promise.all([
            moviesModel.getMoviesForActor(actorId),
            actor.tmdb_id ? tmdbService.getPersonDetails(actor.tmdb_id) : null,
        ]);
        await tmdbService.attachPosters(movies);

        res.render('actor', { title: actor.name, person: actor, movies, tmdbData });
    } catch (err) {
        next(err);
    }
});

router.get('/director/:id', async (req, res, next) => {
    try {
        const directorId = Number(req.params.id);
        const director = await peopleModel.getDirectorById(directorId);
        if (!director) return res.status(404).render('404', { title: 'No encontrado' });

        const [movies, tmdbData] = await Promise.all([
            moviesModel.getMoviesForDirector(directorId),
            director.tmdb_id ? tmdbService.getPersonDetails(director.tmdb_id) : null,
        ]);
        await tmdbService.attachPosters(movies);

        res.render('director', { title: director.name, person: director, movies, tmdbData });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
