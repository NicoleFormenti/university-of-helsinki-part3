require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json())
const morgan = require('morgan')
app.use(morgan('tiny'))
morgan.token('body', (req) => {
    return JSON.stringify(req.body)
  })
const cors = require('cors')
app.use(cors())
app.use(express.static('dist'))

const Entry = require('./models/entry')

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

let persons = []

app.get('/api/persons', (request, response) => {
  Entry.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (req, res) => {
    let display =
        `<p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>`
        res.send(display)
})

app.get('/api/persons/:id', (request, response) => {
  Entry.findById(request.params.id).then(entry => {
    response.json(entry)
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Entry.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end() 
    })
    .catch(error => next(error))
})

  app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (!body.name) {
      return response.status(400).json({ error: 'name missing' })
    } else if (!body.number) {
      return response.status(400).json({error: 'number missing'})
    }
  
    const entry = new Entry({
      name: body.name,
      number: body.number
    })
  
    entry.save().then(savedEntry => {
      response.json(savedEntry)
    })
  })
    
  app.use(unknownEndpoint)
  app.use(errorHandler)

  const PORT = process.env.PORT
  app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
  
  
