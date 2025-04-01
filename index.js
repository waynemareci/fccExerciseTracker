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
  username: { type: String, required: true }
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

app.get('/api/users', async (req, res) => {
  try {
    const allUsers = await User.find({})
    console.log('all users: ' + allUsers)
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
