const { getDb } = require('../config/mongo');
const { ObjectId } = require('mongodb');

const COLLECTION = 'reviews';

function toObjectId(id) {
    try {
        return new ObjectId(id);
    } catch {
        return null;
    }
}

async function createReview({ userId, username, movieId, movieTitle, rating, text, tags }) {
    const db = getDb();
    const doc = {
        userId: String(userId),
        username,
        movieId: Number(movieId),
        movieTitle,
        rating: rating ? Number(rating) : null,
        text,
        tags: Array.isArray(tags) ? tags : [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const { insertedId } = await db.collection(COLLECTION).insertOne(doc);
    return { ...doc, _id: insertedId };
}

async function getReviewsByMovie(movieId) {
    const db = getDb();
    return db
        .collection(COLLECTION)
        .find({ movieId: Number(movieId) })
        .sort({ createdAt: -1 })
        .toArray();
}

async function getReviewsByUser(userId) {
    const db = getDb();
    return db
        .collection(COLLECTION)
        .find({ userId: String(userId) })
        .sort({ createdAt: -1 })
        .toArray();
}

async function getReviewById(id) {
    const db = getDb();
    const _id = toObjectId(id);
    if (!_id) return null;
    return db.collection(COLLECTION).findOne({ _id });
}

// Busqueda flexible por texto libre, pelicula o usuario.
async function searchReviews({ text, movieId, userId }) {
    const db = getDb();
    const query = {};
    if (text) query.text = { $regex: text, $options: 'i' };
    if (movieId) query.movieId = Number(movieId);
    if (userId) query.userId = String(userId);
    return db.collection(COLLECTION).find(query).sort({ createdAt: -1 }).toArray();
}

async function updateReview(id, userId, { text, rating, tags }) {
    const db = getDb();
    const _id = toObjectId(id);
    if (!_id) return null;
    const update = { updatedAt: new Date() };
    if (text !== undefined) update.text = text;
    if (rating !== undefined) update.rating = rating ? Number(rating) : null;
    if (tags !== undefined) update.tags = tags;
    const result = await db
        .collection(COLLECTION)
        .findOneAndUpdate(
            { _id, userId: String(userId) },
            { $set: update },
            { returnDocument: 'after' }
        );
    return result?.value || result;
}

async function deleteReview(id, userId) {
    const db = getDb();
    const _id = toObjectId(id);
    if (!_id) return false;
    const { deletedCount } = await db.collection(COLLECTION).deleteOne({ _id, userId: String(userId) });
    return deletedCount > 0;
}

async function ensureIndexes() {
    const db = getDb();
    await db.collection(COLLECTION).createIndex({ movieId: 1, createdAt: -1 });
    await db.collection(COLLECTION).createIndex({ userId: 1 });
    await db.collection(COLLECTION).createIndex({ text: 'text' });
}

module.exports = {
    createReview,
    getReviewsByMovie,
    getReviewsByUser,
    getReviewById,
    searchReviews,
    updateReview,
    deleteReview,
    ensureIndexes,
};
