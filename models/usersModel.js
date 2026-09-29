const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function createUser({ username, name, email, password }) {
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
        `INSERT INTO users (username, name, email, password_hash)
         VALUES ($1, $2, $3, $4) RETURNING user_id, username, name, email`,
        [username, name, email, passwordHash]
    );
    return rows[0];
}

async function findByUsername(username) {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return rows[0] || null;
}

async function findById(userId) {
    const { rows } = await pool.query(
        'SELECT user_id, username, name, email, created_at FROM users WHERE user_id = $1',
        [userId]
    );
    return rows[0] || null;
}

async function verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
}

async function upsertUserMovie(userId, movieId, fields) {
    const { rows } = await pool.query(
        `INSERT INTO user_movies (user_id, movie_id, is_favorite, is_watched, rating, review, updated_at)
         VALUES ($1, $2,
                 COALESCE($3, false),
                 COALESCE($4, false),
                 $5, $6, now())
         ON CONFLICT (user_id, movie_id) DO UPDATE SET
             is_favorite = COALESCE($3, user_movies.is_favorite),
             is_watched  = COALESCE($4, user_movies.is_watched),
             rating      = COALESCE($5, user_movies.rating),
             review      = COALESCE($6, user_movies.review),
             updated_at  = now()
         RETURNING *`,
        [userId, movieId, fields.isFavorite ?? null, fields.isWatched ?? null, fields.rating ?? null, fields.review ?? null]
    );
    return rows[0];
}

async function getUserMovie(userId, movieId) {
    const { rows } = await pool.query(
        'SELECT * FROM user_movies WHERE user_id = $1 AND movie_id = $2',
        [userId, movieId]
    );
    return rows[0] || null;
}

async function getFavorites(userId) {
    const { rows } = await pool.query(
        `SELECT m.movie_id, m.title, m.release_year, um.rating
         FROM user_movies um JOIN movies m ON m.movie_id = um.movie_id
         WHERE um.user_id = $1 AND um.is_favorite = true ORDER BY m.title`,
        [userId]
    );
    return rows;
}

async function getWatched(userId) {
    const { rows } = await pool.query(
        `SELECT m.movie_id, m.title, m.release_year, um.rating, um.review
         FROM user_movies um JOIN movies m ON m.movie_id = um.movie_id
         WHERE um.user_id = $1 AND um.is_watched = true ORDER BY um.updated_at DESC`,
        [userId]
    );
    return rows;
}

module.exports = {
    createUser,
    findByUsername,
    findById,
    verifyPassword,
    upsertUserMovie,
    getUserMovie,
    getFavorites,
    getWatched,
};
