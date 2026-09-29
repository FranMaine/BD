const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'movieweb';

const client = new MongoClient(uri);
let db = null;

async function connectMongo() {
    if (db) return db;
    await client.connect();
    db = client.db(dbName);
    console.log(`[mongo] conectado a la base "${dbName}"`);
    return db;
}

function getDb() {
    if (!db) {
        throw new Error('MongoDB no esta conectado todavia. Llamar a connectMongo() primero.');
    }
    return db;
}

module.exports = { connectMongo, getDb, client };
