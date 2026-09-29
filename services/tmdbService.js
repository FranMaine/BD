const axios = require('axios');

const BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

const tmdb = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
    params: { api_key: process.env.TMDB_API_KEY, language: 'es-ES' },
});

function posterUrl(path, size = 'w500') {
    return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

function profileUrl(path, size = 'w300') {
    return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

// Envuelve cualquier llamada a TMDB: si falla (sin API key, sin red, 404, etc.)
// devuelve null en lugar de romper el render de la pagina.
async function safeCall(fn) {
    try {
        if (!process.env.TMDB_API_KEY || process.env.TMDB_API_KEY === 'tu_api_key_de_tmdb') {
            return null;
        }
        return await fn();
    } catch (err) {
        console.warn('[tmdb] llamada fallida:', err.message);
        return null;
    }
}

async function getMovieDetails(tmdbId) {
    return safeCall(async () => {
        const { data } = await tmdb.get(`/movie/${tmdbId}`, {
            params: { append_to_response: 'videos,credits' },
        });
        const trailer = (data.videos?.results || []).find(
            (v) => v.site === 'YouTube' && v.type === 'Trailer'
        );
        return {
            posterUrl: posterUrl(data.poster_path),
            backdropUrl: posterUrl(data.backdrop_path, 'w1280'),
            overview: data.overview,
            tagline: data.tagline,
            voteAverage: data.vote_average,
            homepage: data.homepage,
            trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
            genres: (data.genres || []).map((g) => g.name),
        };
    });
}

async function getPersonDetails(tmdbId) {
    return safeCall(async () => {
        const { data } = await tmdb.get(`/person/${tmdbId}`);
        return {
            profileUrl: profileUrl(data.profile_path),
            biography: data.biography,
            birthday: data.birthday,
            placeOfBirth: data.place_of_birth,
        };
    });
}

async function searchMovie(title) {
    return safeCall(async () => {
        const { data } = await tmdb.get('/search/movie', { params: { query: title } });
        return data.results?.[0] || null;
    });
}

module.exports = { getMovieDetails, getPersonDetails, searchMovie, posterUrl, profileUrl };
