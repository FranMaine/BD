const { getDb } = require('../config/mongo');

const COLLECTION = 'user_activity';

// El esquema de "details" varia segun el tipo de evento (RATED_MOVIE,
// ADDED_TO_FAVORITES, WROTE_REVIEW, ...), aprovechando la flexibilidad de MongoDB.
async function logActivity(userId, type, details) {
    const db = getDb();
    const doc = {
        userId: String(userId),
        type,
        timestamp: new Date(),
        details,
    };
    await db.collection(COLLECTION).insertOne(doc);
    return doc;
}

async function getUserTimeline(userId, limit = 20) {
    const db = getDb();
    return db
        .collection(COLLECTION)
        .find({ userId: String(userId) })
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
}

async function ensureIndexes() {
    const db = getDb();
    await db.collection(COLLECTION).createIndex({ userId: 1, timestamp: -1 });
}

module.exports = { logActivity, getUserTimeline, ensureIndexes };
