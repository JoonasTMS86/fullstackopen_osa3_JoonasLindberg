require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')

app.use(express.json())

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :req[content-length] - :response-time ms :body'))

const cors = require('cors')
app.use(cors())
app.use(express.static('dist'))

const PORT = process.env.PORT

const Person = require('./models/person')

const errorHandler = (error, request, response, next) => {
  console.log('error handler called')
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const txt = 'Phonebook has info for ' + persons.length + ' people<br/><br/>' + Date()
    response.send(txt)
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {

      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      console.log(result)
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const personData = request.body

  const person = new Person({
    name: personData.name,
    number: personData.number,
  })

  person.save({ new: true, runValidators: true, context: 'query' })
    .then(personData => {
      response.json(personData)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

app.use(errorHandler)
