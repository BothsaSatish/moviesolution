const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertMovieObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDirectorObjectToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
  SELECT movie_name
  FROM movie`
  const moviesArray = await db.all(getMoviesQuery)
  response.send(moviesArray.map(i => convertMovieObjectToResponseObject(i)))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const movieQuery = `
 INSERT INTO movie{director_id,movie_name,lead_actor}
 VALUES
 (${directorId},
 '${movieName}',
 '${leadActor}',
  );`
  await db.run(movieQuery)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getMoviesQuery = `
  SELECT *
  FROM movie
  WHERE movie_id = ${movieId}`
  const movie = await db.get(getMoviesQuery)
  response.send(movie)
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovieQuery = `
  UPDATE movie
  SET
  director_id = ${directorId},
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  WHERE movie_id = ${movieId};`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:moviesId', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE FROM movie WHERE movie_id = ${movieId};`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getdirectorsQuery = `
  SELECT *
  FROM director`
  const directorArray = await db.all(getdirectorsQuery)
  response.send(
    directorArray.map(eachDirector =>
      convertDirectorObjectToResponseObject(eachDirector),
    ),
  )
})

app.get('/directors/:directorId/movies', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMovieQuery = `
  SELECT movie_name FROM movie WHERE director_id = ${directorId}`
  const movieArray = await db.all(getDirectorMovieQuery)
  response.send(movieArray.map(i => ({movieName: i.movie_name})))
})
module.exports = app
