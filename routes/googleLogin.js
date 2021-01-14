const express = require('express')
const User = require("../models/user.model")
const router = express.Router()
const { OAuth2Client } = require('google-auth-library')

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

router.post('/', async (req, res) => {
  const { token } = req.body
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  const payload = ticket.getPayload()
  console.log('test')
  console.log(payload)

  const query = { 'email': payload.email }

  const user = {
    name: payload.name,
    email: payload.email,
    password: 'TEST_PASSWORD_2',
    isHost: false
  }

  await User.findOneAndUpdate(query, user, { upsert: true }, (err, user) => {
    if (err) {
      res.status(500).send({ error: err })
    } else {
      res.status(200).send('user saved')
    }
  })

})

module.exports = router