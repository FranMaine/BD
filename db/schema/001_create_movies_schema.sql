-- MovieWeb - esquema base (peliculas, personas, keywords)
-- Idempotente: puede ejecutarse varias veces sin romper datos existentes.

CREATE TABLE IF NOT EXISTS movies (
    movie_id        SERIAL PRIMARY KEY,
    tmdb_id         INTEGER UNIQUE,
    title           VARCHAR(255) NOT NULL,
    original_title  VARCHAR(255),
    release_year    INTEGER,
    release_date    DATE,
    genre           VARCHAR(100),
    country         VARCHAR(100),
    language        VARCHAR(50),
    runtime         INTEGER,
    overview        TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS actors (
    actor_id     SERIAL PRIMARY KEY,
    tmdb_id      INTEGER UNIQUE,
    name         VARCHAR(255) NOT NULL,
    birth_date   DATE,
    country      VARCHAR(100),
    biography    TEXT
);

CREATE TABLE IF NOT EXISTS directors (
    director_id  SERIAL PRIMARY KEY,
    tmdb_id      INTEGER UNIQUE,
    name         VARCHAR(255) NOT NULL,
    birth_date   DATE,
    country      VARCHAR(100),
    biography    TEXT
);

CREATE TABLE IF NOT EXISTS movie_cast (
    movie_id        INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
    actor_id        INTEGER NOT NULL REFERENCES actors(actor_id) ON DELETE CASCADE,
    character_name  VARCHAR(255),
    cast_order      INTEGER DEFAULT 0,
    PRIMARY KEY (movie_id, actor_id)
);

CREATE TABLE IF NOT EXISTS movie_directors (
    movie_id     INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
    director_id  INTEGER NOT NULL REFERENCES directors(director_id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, director_id)
);

CREATE TABLE IF NOT EXISTS keywords (
    keyword_id  SERIAL PRIMARY KEY,
    keyword     VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS movie_keywords (
    movie_id    INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
    keyword_id  INTEGER NOT NULL REFERENCES keywords(keyword_id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, keyword_id)
);

CREATE INDEX IF NOT EXISTS idx_movies_title      ON movies (title);
CREATE INDEX IF NOT EXISTS idx_actors_name        ON actors (name);
CREATE INDEX IF NOT EXISTS idx_directors_name     ON directors (name);
CREATE INDEX IF NOT EXISTS idx_keywords_keyword   ON keywords (keyword);
