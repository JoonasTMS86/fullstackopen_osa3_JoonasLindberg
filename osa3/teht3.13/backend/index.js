require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')

app.use(express.json())

morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :req[content-length] - :response-time ms :body'))

const cors = require('cors')
app.use(cors())
app.use(express.static('dist'))

const PORT = process.env.PORT

const Person = require('./models/person')

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })

  app.get('/info', (request, response) => {
    const txt = "Phonebook has info for " + persons.length + " people<br/><br/>" + Date()
    response.send(txt)
  })
  
  app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
  })

  app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(persons => {
      response.json(persons)
    })
  })

  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
  })

  app.post('/api/persons', (request, response) => {
  
    const person = request.body

    const names = persons.map(person => person.name)

    if (names.includes(person.name)) {
        return response.status(400).json({ 
            error: 'name must be unique'
          })
      }

    if (!person.name) {
        return response.status(400).json({ 
          error: 'name missing' 
        })
      }
      if (!person.number) {
        return response.status(400).json({ 
          error: 'number missing' 
        })
      }

    person.id = Math.floor(Math.random() * 100000)
  
    persons = persons.concat(person)
  
    response.json(person)
  })

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })