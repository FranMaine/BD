const pool = require('../config/db');

async function searchAll(term) {
    const like = `%${term}%`;
    const [movies, actors, directors] = await Promise.all([
        pool.query(
            `SELECT movie_id, title, release_year, genre FROM movies
             WHERE title ILIKE $1 ORDER BY title LIMIT 25`,
            [like]
        ),
        pool.query(
            `SELECT actor_id, name FROM actors WHERE name ILIKE $1 ORDER BY name LIMIT 25`,
            [like]
        ),
        pool.query(
            `SELECT director_id, name FROM directors WHERE name ILIKE $1 ORDER BY name LIMIT 25`,
            [like]
        ),
    ]);
    return { movies: movies.rows, actors: actors.rows, directors: directors.rows };
}

async function getById(movieId) {
    const { rows } = await pool.query('SELECT * FROM movies WHERE movie_id = $1', [movieId]);
    return rows[0] || null;
}

async function getDirectorsForMovie(movieId) {
    const { rows } = await pool.query(
        `SELECT d.director_id, d.name FROM directors d
         JOIN movie_directors md ON md.director_id = d.director_id
         WHERE md.movie_id = $1 ORDER BY d.name`,
        [movieId]
    );
    return rows;
}

async function getCastForMovie(movieId) {
    const { rows } = await pool.query(
        `SELECT a.actor_id, a.name, mc.character_name FROM actors a
         JOIN movie_cast mc ON mc.actor_id = a.actor_id
         WHERE mc.movie_id = $1 ORDER BY mc.cast_order, a.name`,
        [movieId]
    );
    return rows;
}

async function getKeywordsForMovie(movieId) {
    const { rows } = await pool.query(
        `SELECT k.keyword_id, k.keyword FROM keywords k
         JOIN movie_keywords mk ON mk.keyword_id = k.keyword_id
         WHERE mk.movie_id = $1 ORDER BY k.keyword`,
        [movieId]
    );
    return rows;
}

async function searchByKeyword(keyword) {
    const { rows } = await pool.query(
        `SELECT DISTINCT m.movie_id, m.title, m.release_year, m.genre
         FROM movies m
         JOIN movie_keywords mk ON mk.movie_id = m.movie_id
         JOIN keywords k ON k.keyword_id = mk.keyword_id
         WHERE k.keyword ILIKE $1
         ORDER BY m.title`,
        [`%${keyword}%`]
    );
    return rows;
}

async function getMoviesForActor(actorId) {
    const { rows } = await pool.query(
        `SELECT m.movie_id, m.title, m.release_year, mc.character_name
         FROM movies m
         JOIN movie_cast mc ON mc.movie_id = m.movie_id
         WHERE mc.actor_id = $1 ORDER BY m.release_year DESC NULLS LAST`,
        [actorId]
    );
    return rows;
}

async function getMoviesForDirector(directorId) {
    const { rows } = await pool.query(
        `SELECT m.movie_id, m.title, m.release_year
         FROM movies m
         JOIN movie_directors md ON md.movie_id = m.movie_id
         WHERE md.director_id = $1 ORDER BY m.release_year DESC NULLS LAST`,
        [directorId]
    );
    return rows;
}

async function getAverageRating(movieId) {
    const { rows } = await pool.query(
        `SELECT ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(rating) AS total
         FROM user_movies WHERE movie_id = $1 AND rating IS NOT NULL`,
        [movieId]
    );
    return rows[0];
}

async function listFeatured(limit = 12) {
    const { rows } = await pool.query(
        `SELECT movie_id, title, release_year, genre FROM movies
         ORDER BY release_year DESC NULLS LAST LIMIT $1`,
        [limit]
    );
    return rows;
}

module.exports = {
    searchAll,
    getById,
    getDirectorsForMovie,
    getCastForMovie,
    getKeywordsForMovie,
    searchByKeyword,
    getMoviesForActor,
    getMoviesForDirector,
    getAverageRating,
    listFeatured,
};
