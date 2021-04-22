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


/*
INPUT:
  title (body) - string name of container to delete
  listingId (body) - ID of listing to add
*/
router.post('/addListing',
  async (req, res) => {
    try {
      const { title, listingId } = req.body
      const listing = await Listing.findById(listingId);
      if (!listing) {
        return res.status(404).json({
          error: 'Listing does not exist.',
        });
      }
      const update = { $push: { listings: listingId } }
      const existingContainer = await Container.findOneAndUpdate({
        title: title,
        update
      })
      if (!existingContainer) {
        return res.status(404).json({
          error: `There is no container titled '${title}'`
        })
      }
      return res.status(200).json({
        message: `Successfully added ${listingId}`
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
router.get('/byTitle/:title',
  async (req, res) => {
    try {
      const existingContainer = await Container.find({
        title: req.params.title,
      })
      if (!existingContainer) {
        return res.status(404).json({
          error: `There is no container titled '${title}'`
        })
      }
      return res.status(200).json({
        existingContainer
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
  title (body) - string name of container to delete
  listingId (body) - ID of listing to add
*/
router.delete('/deleteListing',
  async (req, res) => {
    try {
      const { title, listingId } = req.body
      const update = { $pull: { listings: listingId } }
      const existingContainer = await Container.findOneAndUpdate({
        title: title,
        update
      })
      if (!existingContainer) {
        return res.status(404).json({
          error: `There is no container titled '${title}'`
        })
      }
      return res.status(200).json({
        message: `Successfully removed ${listingId} from '${title}'`
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
