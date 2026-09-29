// Script de configuracion automatica del entorno (npm run dev:setup).
// 1. Crea la base de datos PostgreSQL "movies" si no existe.
// 2. Ejecuta los scripts de esquema (tablas relacionales).
// 3. Inserta datos de prueba (peliculas, actores, directores, usuario demo).
// 4. Crea los indices necesarios en MongoDB.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { connectMongo, client: mongoClient } = require('../config/mongo');
const activityModel = require('../models/activityModel');
const reviewsModel = require('../models/reviewsModel');

const SCHEMA_DIR = path.join(__dirname, '..', 'db', 'schema');
const SEED_DIR = path.join(__dirname, '..', 'db', 'seed');

async function ensureDatabaseExists() {
    const targetDb = process.env.PGDATABASE || 'movies';
    const adminClient = new Client({
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: 'postgres', // base administrativa, siempre existe
    });
    await adminClient.connect();
    try {
        const { rows } = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
        if (rows.length === 0) {
            console.log(`[setup] creando base de datos "${targetDb}"...`);
            await adminClient.query(`CREATE DATABASE "${targetDb}"`);
        } else {
            console.log(`[setup] la base de datos "${targetDb}" ya existe.`);
        }
    } finally {
        await adminClient.end();
    }
}

async function runSchema(pool) {
    // Solo los scripts de creacion (001, 002, ...). El script de borrado (099_drop_all.sql)
    // se ejecuta aparte via "npm run db:drop", nunca durante el setup.
    const files = fs
        .readdirSync(SCHEMA_DIR)
        .filter((f) => /^\d{3}_(?!drop).*\.sql$/.test(f))
        .sort();
    for (const file of files) {
        console.log(`[setup] ejecutando esquema ${file}...`);
        const sql = fs.readFileSync(path.join(SCHEMA_DIR, file), 'utf8');
        await pool.query(sql);
    }
}

async function runSeed(pool) {
    const seedFile = path.join(SEED_DIR, 'seed_data.sql');
    console.log('[setup] insertando datos de prueba...');
    const sql = fs.readFileSync(seedFile, 'utf8');
    await pool.query(sql);

    // Usuario demo con contraseña hasheada en tiempo de ejecucion.
    const passwordHash = await bcrypt.hash('demo1234', 10);
    await pool.query(
        `INSERT INTO users (username, name, email, password_hash)
         VALUES ('demo', 'Usuario Demo', 'demo@movieweb.local', $1)
         ON CONFLICT (username) DO NOTHING`,
        [passwordHash]
    );
}

async function setupMongo() {
    console.log('[setup] configurando indices de MongoDB...');
    await connectMongo();
    await activityModel.ensureIndexes();
    await reviewsModel.ensureIndexes();
    await mongoClient.close();
}

async function main() {
    await ensureDatabaseExists();

    const pool = new Pool({
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
    });

    try {
        await runSchema(pool);
        await runSeed(pool);
    } finally {
        await pool.end();
    }

    await setupMongo();

    console.log('[setup] listo. Usuario demo -> username: demo / password: demo1234');
}

main().catch((err) => {
    console.error('[setup] fallo la configuracion:', err);
    process.exit(1);
});
