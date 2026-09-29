# MovieWeb

Trabajo Practico de **Bases de Datos y Recursos de Informacion (2026)**. Aplicacion web que permite
buscar y explorar peliculas, actores y directores, combinando **PostgreSQL** (datos relacionales),
**MongoDB** (actividad de usuarios y reseñas flexibles) y la **API de TMDB** (posters, sinopsis y
trailers).

## Integrantes del grupo

- Nombre Apellido 1
- Nombre Apellido 2
- Nombre Apellido 3
- Nombre Apellido 4

> Completar con los nombres reales del grupo antes de la entrega.

## Stack tecnico

- **Node.js** + **Express** (servidor y rutas)
- **EJS** (vistas del lado del servidor)
- **PostgreSQL** (`pg`) — peliculas, actores, directores, keywords, usuarios y su relacion con
  peliculas (favoritas / vistas / calificacion)
- **MongoDB** (`mongodb`) — `user_activity` (timeline de eventos) y `reviews` (reseñas extendidas
  con busqueda, edicion y borrado)
- **TMDB API** (`axios`) — enriquecimiento visual (poster, sinopsis, trailer, biografia)
- **express-session** + **bcryptjs** — autenticacion simple de usuarios

## Requisitos previos

1. [Node.js](https://nodejs.org/) 18+ y npm
2. [PostgreSQL](https://www.postgresql.org/) corriendo localmente (o accesible por red)
3. [MongoDB](https://www.mongodb.com/) corriendo localmente (o accesible por red)
4. Una API Key de [TMDB](https://www.themoviedb.org/settings/api) (gratuita)

## Instalacion y ejecucion

### 1. Clonar el repositorio

```bash
git clone https://github.com/FranMaine/BD.git
cd BD
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar el archivo de ejemplo y completar los valores propios:

```bash
cp .env.example .env
```

Editar `.env` con las credenciales de conexion a PostgreSQL, la conexion de MongoDB y la
`TMDB_API_KEY` obtenida en el paso anterior.

### 4. Ejecutar el script de configuracion automatica

Este script crea la base de datos `movies` si no existe, crea todas las tablas (esquema
relacional + usuarios), inserta datos de prueba y prepara los indices de MongoDB:

```bash
npm run dev:setup
```

Al finalizar queda disponible un usuario de prueba: **usuario** `demo` / **contraseña** `demo1234`.

Para borrar todas las tablas relacionales (util para que el corrector reinicie el entorno):

```bash
npm run db:drop
```

### 5. Iniciar la aplicacion

```bash
npm start
```

o, para desarrollo con recarga automatica:

```bash
npm run dev
```

La aplicacion queda disponible en [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

```
BD/
├── app.js                  # punto de entrada, middlewares y montaje de rutas
├── config/                 # conexion a PostgreSQL y MongoDB
├── db/
│   ├── schema/              # scripts de creacion (001, 002) y borrado (099) de tablas
│   └── seed/                 # datos de prueba
├── scripts/
│   ├── setup.js              # npm run dev:setup
│   └── drop.js                # npm run db:drop
├── models/                  # acceso a datos (PostgreSQL y MongoDB)
├── services/tmdbService.js  # integracion con la API de TMDB
├── routes/                  # controladores Express
├── middleware/auth.js       # sesion de usuario
├── views/                   # plantillas EJS
└── public/                  # CSS estatico
```

## Funcionalidades implementadas

- Busqueda simultanea de peliculas, actores y directores (`/buscar?q=...`).
- Paginas de perfil de actor y director, con listado de peliculas y rol.
- Pagina de detalle de pelicula enriquecida con TMDB (poster, sinopsis, trailer).
- Busqueda por palabra clave (`/keyword`).
- Alta de usuarios y login/logout con sesiones.
- Favoritos, marcado de "vista" y calificacion + opinion breve por pelicula (PostgreSQL,
  tabla `user_movies`).
- Timeline de actividad del usuario en MongoDB (`user_activity`), con al menos tres tipos de
  evento: `RATED_MOVIE`, `ADDED_TO_FAVORITES`, `WROTE_REVIEW`.
- Reseñas extendidas en MongoDB (`reviews`) con creacion, busqueda por texto/pelicula/usuario,
  edicion y borrado.

## Decisiones de diseño

### Relacional (PostgreSQL)

El esquema separa `movies`, `actors` y `directors` como entidades propias, vinculadas mediante
tablas intermedias (`movie_cast`, `movie_directors`, `movie_keywords`) para modelar relaciones
muchos-a-muchos (una pelicula tiene varios actores/directores/keywords, y una persona participa
en varias peliculas). Cada entidad guarda su `tmdb_id` para poder enriquecerla con la API externa
sin depender de busquedas por texto. `users` y `user_movies` modelan la interaccion basica del
usuario con el catalogo (favorito, vista, calificacion y opinion corta), con una restriccion
`UNIQUE (user_id, movie_id)` para que cada usuario tenga una unica fila de estado por pelicula.

### No relacional (MongoDB)

`user_activity` usa un esquema flexible por diseño: el campo `details` cambia de forma segun el
`type` de evento, lo cual encaja naturalmente con un documento JSON y hubiera requerido columnas
nulas o tablas adicionales en un modelo relacional. `reviews` se modelo aparte de la calificacion
corta de PostgreSQL para poder iterar sobre el reseñas mas libremente (texto largo, tags,
edicion) sin migraciones de esquema, aprovechando justamente la ventaja de MongoDB frente a un
modelo rigido de columnas.

### Autenticacion

Se uso una sesion simple basada en `express-session` (en memoria) y contraseñas hasheadas con
`bcryptjs`. Es suficiente para el alcance del TP; en produccion se recomendaria un store de
sesiones persistente (Redis, `connect-pg-simple`, etc.).

## Notas para la correccion

- El archivo `.env` **no se versiona** en este repositorio (buenas practicas: no subir secretos a
  un repositorio publico). Al entregar el `.zip` del TP se incluye el `.env` real con la
  `TMDB_API_KEY`, tal como pide la consigna.
- Los `tmdb_id` de los datos de prueba corresponden a peliculas y personas reales de TMDB; si
  alguno no coincide exactamente, el enriquecimiento simplemente no se muestra para esa fila (la
  app no rompe si TMDB no responde o la API key no esta configurada).
