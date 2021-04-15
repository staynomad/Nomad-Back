const express = require('express');
const router = express.Router()

const Container = require('../models/container.model');

router.post('/',
  async (req, res) => {
    try {
      const existingContainer = await Container.find({
        title: title,
      })
      if (existingContainer) {
        return res.status(400).json({
          error: `A container called '${title}' already exists.`
        })
      }
      const { title, listings } = req.body
      const container = await new Container({
        title: title,
        listings: listings
      }).save()
      return res.status(200).json({
        container
      })
    }
    catch(error) {
      console.error(error);
      res.status(500).json({
        "errors":
        "Problem connecting with database. Please try again!"
      });
    }
})


module.exports = router
