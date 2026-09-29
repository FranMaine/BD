-- MovieWeb - datos de prueba
-- Los tmdb_id corresponden a peliculas/personas reales en TMDB, para poder
-- enriquecer las vistas (poster, sinopsis, trailers) con la API externa.
-- Idempotente gracias a ON CONFLICT.

-- Directores
INSERT INTO directors (tmdb_id, name, country) VALUES
    (525,    'Christopher Nolan',    'United Kingdom'),
    (1776,   'Francis Ford Coppola', 'United States of America'),
    (138,    'Quentin Tarantino',    'United States of America'),
    (9339,   'Lana Wachowski',       'United States of America'),
    (108,    'Frank Darabont',       'United States of America'),
    (578,    'Ridley Scott',         'United Kingdom'),
    (5655,   'David Fincher',        'United States of America'),
    (108887, 'Damien Chazelle',      'United States of America'),
    (21684,  'Bong Joon Ho',         'South Korea'),
    (2710,   'James Cameron',        'Canada')
ON CONFLICT (tmdb_id) DO NOTHING;

-- Actores
INSERT INTO actors (tmdb_id, name, country) VALUES
    (6193,  'Leonardo DiCaprio',    'United States of America'),
    (24045, 'Joseph Gordon-Levitt', 'United States of America'),
    (3084,  'Marlon Brando',        'United States of America'),
    (1158,  'Al Pacino',            'United States of America'),
    (8891,  'John Travolta',        'United States of America'),
    (2231,  'Samuel L. Jackson',    'United States of America'),
    (6384,  'Keanu Reeves',         'Canada'),
    (2524,  'Tim Robbins',          'United States of America'),
    (192,   'Morgan Freeman',       'United States of America'),
    (73421, 'Russell Crowe',        'New Zealand'),
    (819,   'Edward Norton',        'United States of America'),
    (287,   'Brad Pitt',            'United States of America'),
    (18918, 'Miles Teller',         'United States of America'),
    (1245,  'J.K. Simmons',         'United States of America'),
    (20868, 'Song Kang-ho',         'South Korea'),
    (65731, 'Kate Winslet',         'United Kingdom')
ON CONFLICT (tmdb_id) DO NOTHING;

-- Peliculas
INSERT INTO movies (tmdb_id, title, original_title, release_year, release_date, genre, country, language, runtime, overview) VALUES
    (27205,  'Inception',                                      'Inception',                                   2010, '2010-07-15', 'Ciencia ficcion', 'United States of America',        'en', 148, 'Un ladron que roba secretos corporativos mediante el uso de tecnologia de sueños compartidos recibe la tarea inversa de plantar una idea en la mente de un CEO.'),
    (238,    'The Godfather',                                   'The Godfather',                               1972, '1972-03-14', 'Drama',           'United States of America',        'en', 175, 'La cronica de la familia Corleone bajo el patriarca Vito Corleone.'),
    (680,    'Pulp Fiction',                                    'Pulp Fiction',                                1994, '1994-09-10', 'Crimen',          'United States of America',        'en', 154, 'Las vidas de dos sicarios, un boxeador y una pareja de ladrones se entrelazan en cuatro historias de violencia.'),
    (603,    'The Matrix',                                      'The Matrix',                                  1999, '1999-03-30', 'Ciencia ficcion', 'United States of America',        'en', 136, 'Un hacker descubre que la realidad tal como la conoce es una simulacion.'),
    (278,    'The Shawshank Redemption',                        'The Shawshank Redemption',                    1994, '1994-09-23', 'Drama',           'United States of America',        'en', 142, 'Dos hombres presos forjan una amistad a lo largo de los años, encontrando consuelo y redencion.'),
    (98,     'Gladiator',                                       'Gladiator',                                   2000, '2000-05-04', 'Accion',          'United Kingdom',                  'en', 155, 'Un general romano traicionado busca venganza convertido en gladiador.'),
    (550,    'Fight Club',                                      'Fight Club',                                  1999, '1999-10-15', 'Drama',           'United States of America',        'en', 139, 'Un oficinista insomne y un fabricante de jabon forman un club de lucha clandestino.'),
    (244786, 'Whiplash',                                        'Whiplash',                                    2014, '2014-10-10', 'Drama',           'United States of America',        'en', 106, 'Un joven baterista de jazz lucha por alcanzar la excelencia bajo la presion de un instructor implacable.'),
    (496243, 'Parasite',                                        'Gisaengchung',                                2019, '2019-05-30', 'Thriller',        'South Korea',                      'ko', 133, 'La familia Kim, desempleada, traza un plan para infiltrarse en la vida de la adinerada familia Park.'),
    (597,    'Titanic',                                         'Titanic',                                     1997, '1997-11-18', 'Romance',         'United States of America',        'en', 195, 'Una joven aristocrata se enamora de un artista pobre a bordo del lujoso e infortunado RMS Titanic.')
ON CONFLICT (tmdb_id) DO NOTHING;

-- Directores de cada pelicula
INSERT INTO movie_directors (movie_id, director_id)
SELECT m.movie_id, d.director_id FROM movies m, directors d WHERE m.tmdb_id = 27205  AND d.tmdb_id = 525
UNION ALL SELECT m.movie_id, d.director_id FROM movies m, directors d WHERE m.tmdb_id = 238    AND d.tmdb_id = 1776
UNION ALL SELECT m.movie_id, d.director_id FROM movies m, directors d WHERE m.tmdb_id = 680    AND d.tmdb_id = 138
UNION ALL SELECT m.movie_id, d.director_id FROM movies m, directors d WHERE m.tmdb_id = 603    AND d.tmdb_id = 9339
UNION ALL SELECT m.movie_id, d.director_id FROM movies m, directors d WHERE m.tmdb_id = 278    AND d.tmdb_id = 108
UNION ALL SELECT m.movie_id, d.director_id FROM movies m, directors d WHERE m.tmdb_id = 98     AND d.tmdb_id = 578
UNION ALL SELECT m.movie_id, d.director_id FROM movies m, directors d WHERE m.tmdb_id = 550    AND d.tmdb_id = 5655
UNION ALL SELECT m.movie_id, d.director_id FROM movies m, directors d WHERE m.tmdb_id = 244786 AND d.tmdb_id = 108887
UNION ALL SELECT m.movie_id, d.director_id FROM movies m, directors d WHERE m.tmdb_id = 496243 AND d.tmdb_id = 21684
UNION ALL SELECT m.movie_id, d.director_id FROM movies m, directors d WHERE m.tmdb_id = 597    AND d.tmdb_id = 2710
ON CONFLICT DO NOTHING;

-- Reparto principal de cada pelicula
INSERT INTO movie_cast (movie_id, actor_id, character_name, cast_order)
SELECT m.movie_id, a.actor_id, 'Dom Cobb', 1        FROM movies m, actors a WHERE m.tmdb_id = 27205  AND a.tmdb_id = 6193
UNION ALL SELECT m.movie_id, a.actor_id, 'Arthur', 2                       FROM movies m, actors a WHERE m.tmdb_id = 27205  AND a.tmdb_id = 24045
UNION ALL SELECT m.movie_id, a.actor_id, 'Don Vito Corleone', 1            FROM movies m, actors a WHERE m.tmdb_id = 238    AND a.tmdb_id = 3084
UNION ALL SELECT m.movie_id, a.actor_id, 'Michael Corleone', 2             FROM movies m, actors a WHERE m.tmdb_id = 238    AND a.tmdb_id = 1158
UNION ALL SELECT m.movie_id, a.actor_id, 'Vincent Vega', 1                 FROM movies m, actors a WHERE m.tmdb_id = 680    AND a.tmdb_id = 8891
UNION ALL SELECT m.movie_id, a.actor_id, 'Jules Winnfield', 2              FROM movies m, actors a WHERE m.tmdb_id = 680    AND a.tmdb_id = 2231
UNION ALL SELECT m.movie_id, a.actor_id, 'Neo', 1                          FROM movies m, actors a WHERE m.tmdb_id = 603    AND a.tmdb_id = 6384
UNION ALL SELECT m.movie_id, a.actor_id, 'Andy Dufresne', 1                FROM movies m, actors a WHERE m.tmdb_id = 278    AND a.tmdb_id = 2524
UNION ALL SELECT m.movie_id, a.actor_id, 'Ellis Boyd Redding', 2           FROM movies m, actors a WHERE m.tmdb_id = 278    AND a.tmdb_id = 192
UNION ALL SELECT m.movie_id, a.actor_id, 'Maximus', 1                      FROM movies m, actors a WHERE m.tmdb_id = 98     AND a.tmdb_id = 73421
UNION ALL SELECT m.movie_id, a.actor_id, 'Narrador', 1                     FROM movies m, actors a WHERE m.tmdb_id = 550    AND a.tmdb_id = 819
UNION ALL SELECT m.movie_id, a.actor_id, 'Tyler Durden', 2                 FROM movies m, actors a WHERE m.tmdb_id = 550    AND a.tmdb_id = 287
UNION ALL SELECT m.movie_id, a.actor_id, 'Andrew Neiman', 1                FROM movies m, actors a WHERE m.tmdb_id = 244786 AND a.tmdb_id = 18918
UNION ALL SELECT m.movie_id, a.actor_id, 'Terence Fletcher', 2             FROM movies m, actors a WHERE m.tmdb_id = 244786 AND a.tmdb_id = 1245
UNION ALL SELECT m.movie_id, a.actor_id, 'Kim Ki-taek', 1                  FROM movies m, actors a WHERE m.tmdb_id = 496243 AND a.tmdb_id = 20868
UNION ALL SELECT m.movie_id, a.actor_id, 'Rose DeWitt Bukater', 1          FROM movies m, actors a WHERE m.tmdb_id = 597    AND a.tmdb_id = 65731
UNION ALL SELECT m.movie_id, a.actor_id, 'Jack Dawson', 2                  FROM movies m, actors a WHERE m.tmdb_id = 597    AND a.tmdb_id = 6193
ON CONFLICT DO NOTHING;

-- Keywords
INSERT INTO keywords (keyword) VALUES
    ('sueños'), ('mafia'), ('venganza'), ('realidad virtual'), ('prision'),
    ('roma antigua'), ('doble personalidad'), ('musica'), ('clase social'), ('naufragio')
ON CONFLICT (keyword) DO NOTHING;

INSERT INTO movie_keywords (movie_id, keyword_id)
SELECT m.movie_id, k.keyword_id FROM movies m, keywords k WHERE m.tmdb_id = 27205  AND k.keyword = 'sueños'
UNION ALL SELECT m.movie_id, k.keyword_id FROM movies m, keywords k WHERE m.tmdb_id = 27205  AND k.keyword = 'realidad virtual'
UNION ALL SELECT m.movie_id, k.keyword_id FROM movies m, keywords k WHERE m.tmdb_id = 238    AND k.keyword = 'mafia'
UNION ALL SELECT m.movie_id, k.keyword_id FROM movies m, keywords k WHERE m.tmdb_id = 680    AND k.keyword = 'venganza'
UNION ALL SELECT m.movie_id, k.keyword_id FROM movies m, keywords k WHERE m.tmdb_id = 603    AND k.keyword = 'realidad virtual'
UNION ALL SELECT m.movie_id, k.keyword_id FROM movies m, keywords k WHERE m.tmdb_id = 278    AND k.keyword = 'prision'
UNION ALL SELECT m.movie_id, k.keyword_id FROM movies m, keywords k WHERE m.tmdb_id = 98     AND k.keyword = 'roma antigua'
UNION ALL SELECT m.movie_id, k.keyword_id FROM movies m, keywords k WHERE m.tmdb_id = 98     AND k.keyword = 'venganza'
UNION ALL SELECT m.movie_id, k.keyword_id FROM movies m, keywords k WHERE m.tmdb_id = 550    AND k.keyword = 'doble personalidad'
UNION ALL SELECT m.movie_id, k.keyword_id FROM movies m, keywords k WHERE m.tmdb_id = 244786 AND k.keyword = 'musica'
UNION ALL SELECT m.movie_id, k.keyword_id FROM movies m, keywords k WHERE m.tmdb_id = 496243 AND k.keyword = 'clase social'
UNION ALL SELECT m.movie_id, k.keyword_id FROM movies m, keywords k WHERE m.tmdb_id = 597    AND k.keyword = 'naufragio'
ON CONFLICT DO NOTHING;

-- El usuario de prueba ("demo" / "demo1234") se crea desde scripts/setup.js,
-- ya que requiere calcular el hash de la contraseña con bcrypt en tiempo de ejecucion.
