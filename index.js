const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const res = require('express/lib/response')

const mongoose = require('mongoose')
const req = require('express/lib/request')
const Schema = mongoose.Schema

const userSchema = new Schema({
  username: { type: String, required: true },
  count: Number,
  log: [{ description: String, duration: Number, date: String }]
})

const User = mongoose.model('User', userSchema)

app.use(bodyParser.urlencoded({ extended: true }))

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.use((req, res, next) => {
  console.log(req.method + ' ' + req.path + ' - ' + req.ip)
  next()
})

app.post('/api/users', async (req, res) => {
  try {
    console.log('body.username: ' + req.body.username)
    const instance = new User({ username: req.body.username })
    const savedUser = await instance.save()
    console.log('after call to createaAndSaveUser; userId is ' + savedUser._id)
    res.json({ username: req.body.username, _id: savedUser._id })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to create item' })
  }
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    console.log('_id: ' + req.params._id)
    console.log('body.description: ' + req.body.description)
    console.log('body.duration: ' + req.body.duration)
    console.log('body.date: ' + req.body.date)
    const date = req.body.date
      ? new Date(req.body.date).toString() === 'Invalid Date'
        ? res.json({ error: 'Invalid Date' })
        : new Date(req.body.date)
      : new Date(Date.now())
    console.log('date: ' + date)
    const formattedDate = date.toDateString()
    console.log('formattedDate: ' + formattedDate)
    const foundUser = await User.findById(req.params._id)
    res.json({
      username: foundUser.username,
      description: req.body.description,
      duration: req.body.duration,
      date: formattedDate,
      _id: req.params._id
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to create exercise' })
  }
})

app.get('/api/users', async (req, res) => {
  try {
    const allUsers = await User.find({})
    //console.log('all users: ' + allUsers)
    res.send(allUsers)
  } catch (error) {
    console.log(error)
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
