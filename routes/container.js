const express = require('express');
const router = express.Router()

const Container = require('../models/container.model');

/*
INPUT:
  title (body) - string name of new container
  listings (body) - array of listing IDs pertaining to new container
*/
router.post('/',
  async (req, res) => {
    try {
      const { title, listings } = req.body
      const existingContainer = await Container.find({
        title: title,
      })
      if (existingContainer) {
        return res.status(400).json({
          error: `A container called '${title}' already exists.`
        })
      }
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
        error: "Problem connecting with database. Please try again!"
      });
    }
})

/*
INPUT:
  title (param) - string name of container to delete
*/
router.delete('/byTitle/:title',
  async (req, res) => {
    try {
      const existingContainer = await Container.findOneAndRemove({
        title: req.params.title,
      }, (err) => {
        return res.status(400).json({
          error: "No containers exist with that title."
        })
        console.log(err)
      })
      return res.status(200).json({
        message: `Successfully deleted ${req.params.title}`
      })
    }
    catch(error) {
      console.error(error);
      res.status(500).json({
        error: "Problem connecting with database. Please try again!"
      });
    }
})


module.exports = router
