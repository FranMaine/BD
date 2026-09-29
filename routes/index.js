const express = require('express');
const router = express.Router();
const moviesModel = require('../models/moviesModel');

router.get('/', async (req, res, next) => {
    try {
        const featured = await moviesModel.listFeatured(12);
        res.render('index', { title: 'MovieWeb', featured });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
