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

  app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id) 
    persons = persons.filter(entry => entry.id !== id)
    res.status(204).end()
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
    

  const PORT = process.env.PORT
  app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
  
  
