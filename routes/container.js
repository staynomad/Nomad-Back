const express = require('express');
const router = express.Router()
const Container = require('../models/container.model');
const Listing = require('../models/listing.model')

/*
INPUT:
  title (body) - string name of new container
  listings (body) - array of listing IDs pertaining to new container
*/
router.post('/',
  async (req, res) => {
    try {
      const { title, listings } = req.body
      for (let i = 0; i < listings.length; i++) {
        const len = listings[i].length
        let temp = listings[i]
        for (let j = len; j < 12; j++) {
          temp += '0'
        }
        const listing = await Listing.findOne({
          _id: temp
        })
        if (!listing) {
          return res.status(400).json({
            error: `${listings[i]} is not a valid listingId`
          })
        }
      }
      const existingContainer = await Container.findOne({
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
  title (body) - string name of container to delete
*/
router.delete('/byTitle',
  async (req, res) => {
    try {
      const { title } = req.body
      const existingContainer = await Container.findOneAndRemove({
        title: title,
      }, (err) => {
        if (err) {
          return res.status(400).json({
            error: "No containers exist with that title."
          })
          console.log(err)
        }
      })
      return res.status(200).json({
        message: `Successfully deleted ${title}`
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
      const existingContainer = await Container.findOneAndUpdate({
        title: title,
        $push: { listings: listingId }
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
  title (body) - string name of container to return
*/
router.get('/byTitle',
  async (req, res) => {
    try {
      const { title } = req.body;
      const existingContainer = await Container.findOne({
        title: title,
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
      const existingContainer = await Container.findOne({
        title: title,
      })
      if (!existingContainer) {
        return res.status(404).json({
          error: `There is no container titled '${title}'`
        })
      }
      const idx = existingContainer.listings.indexOf(listingId)
      if (idx !== -1) {
        let updatedListings = existingContainer.listings
        updatedListings.splice(idx, 1)
        const updatedContainer = await Container.findOneAndUpdate({
          title: title,
          listings: updatedListings
        })
        return res.status(200).json({
          message: `Successfully removed ${listingId} from '${title}'`
        })
      }
      return res.status(404).json({
        message: `${listingId} does not exist in '${title}'`
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
  Null
*/
router.get('/allContainers',
  async (req, res) => {
    try {
      const containers = await Container.find()
      if (!containers) {
        return res.status(404).json({
          error: `There are no containers.`
        })
      }
      return res.status(200).json({
        containers
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
