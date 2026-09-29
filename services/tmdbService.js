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

// Cache en memoria del proceso: los posters/fotos de las mismas peliculas y
// personas se piden una y otra vez en cada listado (home, busqueda, perfiles),
// asi que evitamos golpear la API de TMDB en cada request.
const posterCache = new Map();
const profileThumbCache = new Map();

async function getMoviePosterThumb(tmdbId) {
    if (!tmdbId) return null;
    if (posterCache.has(tmdbId)) return posterCache.get(tmdbId);
    const result = await safeCall(async () => {
        const { data } = await tmdb.get(`/movie/${tmdbId}`, { params: { language: 'es-ES' } });
        return posterUrl(data.poster_path, 'w342');
    });
    posterCache.set(tmdbId, result);
    return result;
}

async function getPersonThumb(tmdbId) {
    if (!tmdbId) return null;
    if (profileThumbCache.has(tmdbId)) return profileThumbCache.get(tmdbId);
    const result = await safeCall(async () => {
        const { data } = await tmdb.get(`/person/${tmdbId}`);
        return profileUrl(data.profile_path, 'w185');
    });
    profileThumbCache.set(tmdbId, result);
    return result;
}

// Adjunta `posterUrl` a cada fila que tenga tmdb_id, en paralelo.
async function attachPosters(rows) {
    await Promise.all(
        rows.map(async (row) => {
            row.posterUrl = await getMoviePosterThumb(row.tmdb_id);
        })
    );
    return rows;
}

// Adjunta `thumbUrl` a cada fila (actor/director) que tenga tmdb_id, en paralelo.
async function attachProfileThumbs(rows) {
    await Promise.all(
        rows.map(async (row) => {
            row.thumbUrl = await getPersonThumb(row.tmdb_id);
        })
    );
    return rows;
}

module.exports = {
    getMovieDetails,
    getPersonDetails,
    searchMovie,
    posterUrl,
    profileUrl,
    getMoviePosterThumb,
    getPersonThumb,
    attachPosters,
    attachProfileThumbs,
};
