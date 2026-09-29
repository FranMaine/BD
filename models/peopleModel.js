const pool = require('../config/db');

async function getActorById(actorId) {
    const { rows } = await pool.query('SELECT * FROM actors WHERE actor_id = $1', [actorId]);
    return rows[0] || null;
}

async function getDirectorById(directorId) {
    const { rows } = await pool.query('SELECT * FROM directors WHERE director_id = $1', [directorId]);
    return rows[0] || null;
}

module.exports = { getActorById, getDirectorById };
