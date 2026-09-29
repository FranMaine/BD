-- MovieWeb - usuarios e interacciones
-- Idempotente: puede ejecutarse varias veces sin romper datos existentes.

CREATE TABLE IF NOT EXISTS users (
    user_id        SERIAL PRIMARY KEY,
    username       VARCHAR(50) UNIQUE NOT NULL,
    name           VARCHAR(255) NOT NULL,
    email          VARCHAR(255) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_movies (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    movie_id     INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
    is_favorite  BOOLEAN NOT NULL DEFAULT false,
    is_watched   BOOLEAN NOT NULL DEFAULT false,
    rating       SMALLINT CHECK (rating BETWEEN 1 AND 5),
    review       TEXT,
    updated_at   TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (user_id, movie_id)
);

CREATE INDEX IF NOT EXISTS idx_user_movies_user   ON user_movies (user_id);
CREATE INDEX IF NOT EXISTS idx_user_movies_movie  ON user_movies (movie_id);
