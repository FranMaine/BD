// Borra todas las tablas del esquema relacional (npm run db:drop).
// Util para que el corrector pueda reiniciar el entorno facilmente.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function main() {
    const pool = new Pool({
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
    });
    const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema', '099_drop_all.sql'), 'utf8');
    try {
        console.log('[drop] borrando todas las tablas...');
        await pool.query(sql);
        console.log('[drop] listo.');
    } finally {
        await pool.end();
    }
}

main().catch((err) => {
    console.error('[drop] fallo:', err);
    process.exit(1);
});
