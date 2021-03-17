const express = require("express");
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { baseURL } = require('../config/index');
const Listing = require("../models/listing.model");
const { requireUserAuth, getUserInfo } = require("../utils");
const { multerUploads, uploadImagesToAWS } = require("./photos");
// const { check, validationResult } = require("express-validator");
const popularity = require('../models/popularity.model');

const router = express.Router();

const fs = require('fs')
const ics = require('ics')

/* Add a listing */
router.post("/createListing", multerUploads, requireUserAuth, async (req, res) => {
  try {
    const {
      title,
      location,
      description,
      details,
      price,
      available,
      booked,
      calendarURL,
      amenities,
    } = JSON.parse(req.files['listingData'][0].buffer.toString()).newListing;

    console.log(JSON.parse(req.files['listingData'][0].buffer.toString()).newListing)

    const imageUploadRes = await uploadImagesToAWS(req.files['image']);

    const verifyData = {
      title,
      location,
      pictures: imageUploadRes,
      description,
      details,
      price,
      available,
    };

    for (const key in verifyData) {
      if (verifyData.hasOwnProperty(key)) {
        if (!verifyData[key]) {
          return res.status(400).json({
            error: `Entry for ${key} is invalid`,
          });
        };
      };
    };

    const newListing = await new Listing({
      title,
      location,
      pictures: imageUploadRes,
      description,
      details,
      price,
      available,
      booked,
      calendarURL,
      amenities,
      active: false,
      userId: req.user._id,
    }).save();

    // Need to talk about return values, validation, etc.
    res.status(201).json({
      newListingId: newListing._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ['Error occurred while creating listing. Please try again!'],
    });
  }
});

// Change listing's active field to true
router.put('/activateListing/:listingId', requireUserAuth, async (req, res) => {
  try {
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.listingId },
      { $set: { active: true } },
      { returnNewDocument: true }
    );
    if (!listing) {
      return res.status(400).json({
        error: 'Listing does not exist. Please try again.',
      });
    }

    const userInfo = await getUserInfo(req.user._id);
    // Send confirmation email to host
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vhomesgroup@gmail.com',
        pass: 'yowguokryuzjmbhj',
      },
    });
    const userMailOptions = {
      from: '"VHomes" <reservations@vhomesgroup.com>',
      to: userInfo.email,
      subject: `Thank you for listing on VHomes!`,
      text: `Your listing is live! Click the following link to view your listing page.

         ${baseURL}/listing/${req.params.listingId}`,
      html: `<p>
          Your listing is live! Click the following link to view your listing page. <br>
          <a href="${baseURL}/listing/${req.params.listingId}">${baseURL}/listing/${req.params.listingId}</a>
         </p>`,
    };
    transporter.sendMail(userMailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(
          `Create listing confirmation email sent to ${userInfo.email}`
        );
      }
    });
    return res.status(200).json({
      message: 'Successfully activated listing',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error occurred while activating listing. Please try again!',
    });
  }
});

// Change listing's active field to false
router.put('/deactivateListing/:listingId', requireUserAuth, async (req, res) => {
  try {
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.listingId },
      { $set: { active: false } },
      { returnNewDocument: true }
    );
    if (!listing) {
      return res.status(400).json({
        error: 'Listing does not exist. Please try again.',
      });
    }
    return res.status(200).json({
      message: 'Successfully activated listing',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error occurred while deactivating listing. Please try again!',
    });
  }
});

/* Update a listing */
router.put('/editListing/:listingId', requireUserAuth, async (req, res) => {
  try {
    console.log(req.user);
    const listing = await Listing.findOne({
      _id: req.params.listingId,
      userId: req.user._id,
    });

    if (!listing) {
      res.status(404).json({
        errors: ['Listing was not found. Please try again!'],
      });
    } else {
      const updatedKeys = Object.keys(req.body);
      updatedKeys.forEach(async (key) => {
        if (
          key &&
          key !== null &&
          listing[key] !== req.body[key] &&
          key !== 'listingId'
        ) {
          console.log('changing ' + key);
          listing[key] = req.body[key];
        }
      });
      await listing.save();
      res.status(200).json({
        listing,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ['Error occurred while creating listing. Please try again!'],
    });
  }
});

/* Get all listings */
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find({});
    if (!listings) {
      res.status(404).json({
        errors: ['There are currently no listings! Please try again later.'],
      });
    } else {
      res.status(200).json({
        listings,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ['Error occurred while getting listings. Please try again!'],
    });
  }
});

/* Get all active listings */
router.get('/active', async (req, res) => {
  try {
    const listings = await Listing.find({ active: true });
    if (!listings) {
      res.status(404).json({
        errors: ['There are currently no listings! Please try again later.'],
      });
    } else {
      res.status(200).json({
        listings,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ['Error occurred while getting listings. Please try again!'],
    });
  }
});

/* Get all listings by filter */
router.post('/filteredListings', async (req, res) => {
  try {
    var listings;
    minRating = 0, startingPrice = 10000; minGuests = 0;
    // if (minRatingClicked) {
    //   minRating = req.body.minRating
    // }
    if (req.body.startingPriceClicked) {
      startingPrice = req.body.startingPrice
    }
    if (req.body.minGuestsClicked) {
      minGuests = req.body.minGuests
    }
    listings = await Listing.find({
      // 'rating.user': { $gte: minRating },
      price: { $lte: startingPrice },
      'details.maxpeople': { $gte: minGuests },
      active: true,
    });
    if (!listings) {
      res.status(404).json({
        errors: ['There are currently no listings! Please try again later.'],
      });
    } else {
      res.status(200).json({
        listings,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ['Error occurred while getting listings. Please try again!'],
    });
  }
});

/* Get all listings in a radius around lat and lng */
router.get("/byRadius", async (req, res) => {
  try {
    await Listing.find({}, (err, listingDocs) => {
      if (err || !listingDocs) {
        res.status(404).json({
          errors: ["There are currently no listings! Please try again later."],
        });
      } else {
        // Radius will be in kilometers
        const { lat, lng, radiusInKilometers } = req.query;

        const listingsInRadius = listingDocs.filter(listing => {
          if (!listing.coords.listingLat || !listing.coords.listingLng || !listing.active) return false;
          else {
            const { listingLat, listingLng } = listing.coords;
            const listingLatConverted = parseFloat(listingLat, 10);
            const listingLngConverted = parseFloat(listingLng, 10);

            const ky = 40000 / 360;
            const kx = Math.cos(Math.PI * lat / 180.0) * ky;
            const dx = Math.abs(lng - listingLngConverted) * kx;
            const dy = Math.abs(lat - listingLatConverted) * ky;

            // console.log(Math.sqrt(dx ** 2 + dy ** 2))
            // console.log(radiusInKilometers)
            // console.log(Math.sqrt(dx ** 2 + dy ** 2) <= radiusInKilometers)

            return Math.sqrt(dx ** 2 + dy ** 2) <= radiusInKilometers;
          };
        });

        res.status(200).json({
          listingsInRadius,
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ["Error occurred while getting listings. Please try again!"],
    });
  }
});

const getByUserIdFunc = async (userId) => {
  return await Listing
    .find({ userId: userId })
    .catch((err) => {
      return err;
    });
};

/* Get all listings belonging to user in parameter */
router.get('/byUserId/:userId', async (req, res) => {
  const userListings = await getByUserIdFunc(req.params.userId);
  if (userListings instanceof Error) {
    return res.status(500).json({
      errors: 'Error occured while getting popular listings',
    });
  }
  if (!userListings) {
    return res.status(404).json({
      errors: ['There are currently no listings! Please try again later.'],
    });
  } else {
    return res.status(200).json({
      userListings,
    });
  }
});

/* Get listing by listingID (MongoDB Object ID) */
router.get('/byId/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      res.status(404).json({
        errors: ['Listing does not exist.'],
      });
    } else {
      res.status(200).json({
        listing,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ['Error occurred while getting listings. Please try again!'],
    });
  }
});

/* Get listing by search term */
router.post('/search', async (req, res) => {
  const { itemToSearch } = req.body;
  try {
    let decodedItemToSearch = decodeURI(itemToSearch).toLowerCase();
    const listings = await Listing.find({ active: true });
    const filteredListings = listings.filter((listing) => {
      const { street, city, zipcode, state } = listing.location;
      if (
        street.toLowerCase().includes(decodedItemToSearch) ||
        city.toLowerCase().includes(decodedItemToSearch) ||
        zipcode.includes(decodedItemToSearch) ||
        state.toLowerCase().includes(decodedItemToSearch)
      )
        return true;
    });

    if (filteredListings.length === 0) {
      return res.status(404).json({
        errors: ['There were no listings found with the given search term.'],
      });
    } else {
      res.status(200).json({
        filteredListings,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [
        'Error occurred while searching for listings. Please try again!',
      ],
    });
  }
});

/* Delete listing by id */
router.delete('/delete/:listingId', requireUserAuth, async (req, res) => {
  try {
    const listing = await Listing.findOne({
      _id: req.params.listingId,
      userId: req.user._id,
    });

    if (!listing) {
      res.status(500).json({
        errors: ['Listing was not found. Please try again!'],
      });
    } else {
      listing.remove();
      res.status(200).json({
        message: ['Listing was removed.'],
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [
        'Error occurred while attempting to remove listing. Please try again.',
      ],
    });
  }
});

router.put('/syncListing/:listingId', async (req, res) => {
  try {
    let { booked } = req.body;
    let prevListings = await Listing.findOne({ _id: req.params.listingId });

    // Cleans booked array to only include non-duplicate booked items
    prevListings = prevListings.booked.sort((a, b) => (a.end > b.end ? 1 : -1));
    booked = booked.sort((a, b) => (a.end > b.end ? 1 : -1));

    let cleaned_booked = [];
    let prev_ptr = 0;
    let booked_ptr = 0;
    while (prev_ptr < prevListings.length || booked_ptr < booked.length) {
      if (prev_ptr >= prevListings.length) {
        cleaned_booked.push(booked[booked_ptr]);
        booked_ptr++;
      } else if (booked_ptr >= booked.length) {
        break;
      } else if (
        prevListings[prev_ptr].end === booked[booked_ptr].end &&
        prevListings[prev_ptr].start === booked[booked_ptr].start
      ) {
        booked_ptr++;
        prev_ptr++;
      } else if (prevListings[prev_ptr].end > booked[booked_ptr].end) {
        cleaned_booked.push(booked[booked_ptr]);
        booked_ptr++;
      } else {
        prev_ptr++;
      }
    }

    if (cleaned_booked.length > 0) {
      const update = {
        $push: { booked: cleaned_booked },
      };
      const listing = await Listing.findOneAndUpdate(
        { _id: req.params.listingId },
        update
      );
      if (!listing) {
        return res.status(400).json({
          error: 'Listing does not exist. Please try again.',
        });
      }
    }
    return res.status(200).json({
      message: 'Successfully updated listing availability',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error:
        'Error occurred while attempting to sync listing. Please try again.',
    });
  }
});

// Get all transfer requests
router.get('/byTransferEmail', requireUserAuth, async (req, res) => {
  try {
    const listingsToTransfer = await Listing.find({
      'transferEmail.to': req.user.email,
    });
    if (!listingsToTransfer) {
      res.status(404).json({
        errors: ['No listing transfer request(s) found.'],
      });
    } else {
      res.status(200).json({
        listingsToTransfer,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ['An error occurred while searching for listing transfers.'],
    });
  }
});

// Send request to transfer listing
router.put('/sendListingTransfer', requireUserAuth, async (req, res) => {
  try {
    const { email, listingId } = req.body;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vhomesgroup@gmail.com',
        pass: 'yowguokryuzjmbhj',
      },
    });
    const userMailOptions = {
      from: '"VHomes" <reservations@vhomesgroup.com>',
      to: email,
      subject: `You've Been Invited!`,
      // we want to include the original host's name here as well
      text: `
          ${req.user.name} has invited you to host their listing! To accept this invitation, please do the following:
              1. Go to ${baseURL}/MyAccount. If you do not yet have a VHomes account, please sign up for a host account first.
              2. Navigate to your profile and select "Transfer Requests" on the side menu. Here, you will see the listings you have been invited to host.
              3. To accept all requests, simply click "Accept All." If you would like to accept an individual request, click "Accept" under the listing you want to accept.
              4. You're all done! Click on "My Listings" in the side menu to view your new listing.
          `,
      html: `
          <p>
          ${req.user.name} has invited you to host their listing! To accept this invitation, please do the following:
              1. Go to <a href="${baseURL}/MyAccount">${baseURL}/MyAccount</a>. If you do not yet have a VHomes account, please sign up for a host account first.
              2. Navigate to your profile and select "Transfer Requests" on the side menu. Here, you will see the listings you have been invited to host.
              3. To accept all requests, simply click "Accept All." If you would like to accept an individual request, click "Accept" under the listing you want to accept.
              4. You're all done! Click on "My Listings" in the side menu to view your new listing.
          </p>
          `,
    };

    const transferEmail = { from: req.user.email, to: email };
    const listingToTransfer = await Listing.findOneAndUpdate(
      { _id: listingId },
      { transferEmail }
    );
    if (!listingToTransfer) {
      return res.status(404).json({
        errors: 'Listing could not be found.',
      });
    } else {
      transporter.sendMail(userMailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log(`Transfer request has been sent to ${email}`);
        }
      });
      res.status(200).json({
        message: `Transfer request has been sent to ${email}`,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: ['Error transferring listing. Please try again!'],
    });
  }
});

// Accept request(s)
router.put('/acceptListingTransfer', requireUserAuth, async (req, res) => {
  try {
    const { acceptAll, listingId } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vhomesgroup@gmail.com',
        pass: 'yowguokryuzjmbhj',
      },
    });

    if (acceptAll) {
      const listingsToTransfer = await Listing.find({
        'transferEmail.to': req.user.email,
      });
      if (!listingsToTransfer) {
        res.status(404).json({
          errors: ['No listing transfer request(s) found.'],
        });
      } else {
        let groupByEmail = {};
        listingsToTransfer.forEach((listing) => {
          const userToMailTo = listing.transferEmail.from;
          if (groupByEmail[userToMailTo])
            groupByEmail[userToMailTo].push(listing);
          else groupByEmail[userToMailTo] = [listing];
        });

        Object.keys(groupByEmail).forEach(async (email) => {
          let currentEmailGroup = groupByEmail[email];
          let listingEmailBody = [];

          for (let i = 0; i < currentEmailGroup.length; i++) {
            const currentListing = currentEmailGroup[i];

            listingEmailBody.push(currentListing._id);
            currentListing.transferEmail = {};
            currentListing.userId = mongoose.Types.ObjectId(req.user._id);
            await currentListing.save();
          }

          let userMailOptions = {
            from: '"VHomes" <reservations@vhomesgroup.com>',
            to: email,
            subject: `Your Transfer Was Successful!`,
            // we'll need to add in the new host's name here
            text: `
                ${req.user.name
              } has accepted your invitation! You will no longer have access to the following listing(s):
                  ${listingEmailBody.join('\n')}
              `,
            html: `
                <p>
                  ${req.user.name
              } has accepted your invitation! You will no longer have access to the following listing(s):
                  ${listingEmailBody.join('\n')}
                </p>
              `,
          };

          transporter.sendMail(userMailOptions, (error, info) => {
            if (error) {
              console.log(error);
            } else {
              console.log(`All transfers successful`);
            }
          });
        });

        res.status(200).json({
          listingsToTransfer,
        });
      }
    } else {
      const listingToTransfer = await Listing.findById(listingId);
      if (!listingToTransfer) {
        return res.status(404).json({
          errors: 'Listing could not be found.',
        });
      } else {
        const emailToSendTo = listingToTransfer.transferEmail.from;
        listingToTransfer.userId = mongoose.Types.ObjectId(req.user._id);
        listingToTransfer.transferEmail = {};
        await listingToTransfer.save();

        let userMailOptions = {
          from: '"VHomes" <reservations@vhomesgroup.com>',
          to: emailToSendTo,
          subject: `Your Transfer Was Successful!`,
          // we'll need to add in the new host's name here
          text: `
              ${req.user.name} has accepted your invitation! You will no longer have access to the following listing(s):
                ${listingToTransfer._id}
            `,
          html: `
              <p>
                ${req.user.name} has accepted your invitation! You will no longer have access to the following listing(s):
                  ${listingToTransfer._id}
              </p>
            `,
        };
        transporter.sendMail(userMailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log(`Transfer successful`);
          }
        });
        res.status(200).json({
          listingToTransfer,
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ['An error occurred while searching for listing transfers.'],
    });
  }
});

// Reject request(s)
router.put('/rejectListingTransfer', requireUserAuth, async (req, res) => {
  try {
    const { rejectAll, listingId } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vhomesgroup@gmail.com',
        pass: 'yowguokryuzjmbhj',
      },
    });

    if (rejectAll) {
      const listingsToTransfer = await Listing.find({
        'transferEmail.to': req.user.email,
      });
      if (!listingsToTransfer) {
        res.status(404).json({
          errors: ['No listing transfer request(s) found.'],
        });
      } else {
        let groupByEmail = {};
        listingsToTransfer.forEach((listing) => {
          const userToMailTo = listing.transferEmail.from;
          if (groupByEmail[userToMailTo])
            groupByEmail[userToMailTo].push(listing);
          else groupByEmail[userToMailTo] = [listing];
        });

        Object.keys(groupByEmail).forEach(async (email) => {
          let currentEmailGroup = groupByEmail[email];
          let listingEmailBody = [];

          for (let i = 0; i < currentEmailGroup.length; i++) {
            const currentListing = currentEmailGroup[i];

            listingEmailBody.push(currentListing._id);
            currentListing.transferEmail = {};
            await currentListing.save();
          }

          let userMailOptions = {
            from: '"VHomes" <reservations@vhomesgroup.com>',
            to: email,
            subject: `Your Transfer Was Rejected`,
            // we'll need to add in the new host's name here
            text: `
                ${req.user.name
              } has rejected your invitation. You will retain access to the following listing(s):
                  ${listingEmailBody.join('\n')}
              `,
            html: `
                <p>
                ${req.user.name
              } has rejected your invitation. You will retain access to the following listing(s):
                  ${listingEmailBody.join('\n')}
                </p>
              `,
          };

          transporter.sendMail(userMailOptions, (error, info) => {
            if (error) {
              console.log(error);
            } else {
              console.log(`All transfers successfully rejected`);
            }
          });
        });

        res.status(200).json({
          listingsToTransfer,
        });
      }
    } else {
      const listingToTransfer = await Listing.findById(listingId);
      if (!listingToTransfer) {
        return res.status(404).json({
          errors: 'Listing could not be found.',
        });
      } else {
        let emailToSendTo = listingToTransfer.transferEmail.from;
        listingToTransfer.transferEmail = {};
        await listingToTransfer.save();

        let userMailOptions = {
          from: '"VHomes" <reservations@vhomesgroup.com>',
          to: emailToSendTo,
          subject: `Your Transfer Was Rejected`,
          // we'll need to add in the new host's name here
          text: `
                ${req.user.name} has rejected your invitation. You will retain access to the following listing(s):
                  ${listingToTransfer._id}
              `,
          html: `
                <p>
                ${req.user.name} has rejected your invitation. You will retain access to the following listing(s):
                  ${listingToTransfer._id}
                </p>
            `,
        };
        transporter.sendMail(userMailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log(`Transfer rejection successful`);
          }
        });
        res.status(200).json({
          listingToTransfer,
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ['An error occurred while searching for listing transfers.'],
    });
  }
});

router.put('/increment/:listingId', (req, res) => {
  currDay = new Date().getDay();
  popularity.findOneAndUpdate(
    { listingId: req.params.listingId },
    {
      $inc: { visitCount: 1, ['visits.' + currDay]: 1 },
      $set: { last_visited: new Date() },
    },
    (err, doc) => {
      if (!doc) {
        // if the their is no corresponding document in popularity collection
        // then look into the listing collection to check if it exist
        Listing.findOne(
          { _id: req.params.listingId, active: true },
          (nerr, ndoc) => {
            if (!ndoc) {
              res.status(404).json({
                errors: ['Listing does not exist or listing is not active'],
              });
            } else if (nerr) {
              res.status(500).json({
                errors: ['Error occured while finding corresponding listing'],
              });
            } else {
              visits = [0, 0, 0, 0, 0, 0, 0];
              visits[currDay] = 1;
              popularity
                .create({
                  listingId: req.params.listingId,
                  visitCount: 1,
                  visits: visits,
                  last_visited: new Date(),
                })
                .then(() => res.status(200).json({ success: true }))
                .catch((terr) => {
                  console.log(terr);
                  res.status(500).json({
                    errors: [
                      'Error occurred while creating new popularity field. Please try again!',
                    ],
                  });
                });
            }
          }
        );
      } else if (err) {
        console.log(err);
        res.status(500).json({
          errors: [
            'Error occurred while incrementing listings. Please try again!',
          ],
        });
      } else {
        res.status(200).json({ success: true });
      }
    }
  );
});

const getPopularFunc = (numberOfListings) => {
  return popularity
    .find({}, null, { sort: { visitCount: -1 }, limit: numberOfListings })
    .catch((err) => {
      return err;
    });
};

router.get('/popularlistings/:numberOfListing', async (req, res) => {
  let numberOfListing = parseInt(req.params.numberOfListing);
  if (numberOfListing < 5) {
    numberOfListing = 5;
  }
  if (numberOfListing == 0) {
    res.status(200).json({
      listings: [],
    });
    return;
  }
  if (isNaN(numberOfListing)) {
    res
      .status(400)
      .json({ errors: 'Parameter argument provided should be integers' });
    return;
  }
  try {
    const listings = await getPopularFunc(numberOfListing);
    if (listings.length < 5) {
      const listingSet = new Set();
      for (element of listings) {
        listingSet.add(element.listingId);
      }
      const newListing = await Listing.find({ active: true }).limit(5);
      for (element of newListing) {
        if (!listingSet.has(element)) {
          listings.push({ listingId: element._id });
        }
        if (listings.length == 5) {
          break;
        }
      }
    }
    res.status(200).json({ listings });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: 'There was an error while getting the popular listings' });
  }
});

router.get('/allPopularityListings', async (req, res) => {
  const listings = await getPopularFunc(0);
  if (listings instanceof Error) {
    res.status(500).json({
      errors: 'Error occured while getting popular listings',
    });
  } else {
    res.status(200).json({ listings });
  }
});

// router.put('/resetCount', (req, res) => {
//   const temp = require('../config/taskScheduler');
//   temp();
//   res.status(200).json({ success: true });
// });

router.post('/exportListing', async (req, res) => {
  const { userId, listingId, listingCalendar } = req.body
  var curr = new Date;
  var events = [
    {
      title: 'NomΛd Listing',
      description: 'UNAVAILABLE',
      url: `${baseURL}/listing/${listingId}`,
      start: [curr.getFullYear(), 1, 1],
      end: [listingCalendar.available[0].substring(0, 4), listingCalendar.available[0].substring(5, 7), listingCalendar.available[0].substring(8)]
    },
    {
      title: 'NomΛd Listing',
      description: 'UNAVAILABLE',
      url: `${baseURL}/listing/${listingId}`,
      start: [listingCalendar.available[1].substring(0, 4), listingCalendar.available[1].substring(5, 7), listingCalendar.available[1].substring(8)],
      end: [curr.getFullYear() + 1, 12, 31]
    },
  ]
  for (let i = 0; i < listingCalendar.booked.length; i++) {
    events.push({
      title: 'NomΛd Listing',
      description: 'UNAVAILABLE',
      url: `${baseURL}/listing/${listingId}`,
      start: [listingCalendar.booked[i].start.substring(0, 4), listingCalendar.booked[i].start.substring(5, 7), listingCalendar.booked[i].start.substring(8)],
      end: [listingCalendar.booked[i].end.substring(0, 4), listingCalendar.booked[i].end.substring(5, 7), listingCalendar.booked[i].end.substring(8)],
    })
  }
  ics.createEvents(events, (error, value) => {
    if (error) {
      console.log(error)
    }
    fs.writeFile(
      `./exports/${userId}-${listingId}.ics`,
      value,
      { flag: 'w' },
      (err) => {
        if (err) return res.status(400).json({
          errors: "Unable to export file."
        });
        return res.status(200).json({ url: `${exportURL}/exports/${userId}-${listingId}.ics` })
      }
    )
  })
});

module.exports = router;
