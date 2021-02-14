const express = require('express');
const router = express.Router();
const { baseURL } = require('../config/index');
const Listing = require('../models/listing.model');
const { requireUserAuth, getUserInfo } = require('../utils');
// const { check, validationResult } = require("express-validator");
const popularity = require('../models/popularity.model');

const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

/* Add a listing */
router.post('/createListing', requireUserAuth, async (req, res) => {
  try {
    const {
      title,
      location,
      pictures,
      description,
      details,
      price,
      available,
      booked,
      calendarURL,
      amenities,
    } = req.body;

    const verifyData = {
      title,
      location,
      pictures,
      description,
      details,
      price,
      available,
    };

    for (var key in verifyData) {
      if (verifyData.hasOwnProperty(key)) {
        if (!verifyData[key]) {
          return res.status(400).json({
            error: `Entry for ${key} is invalid`,
          });
        }
      }
    }

    const newListing = await new Listing({
      title,
      location,
      pictures,
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
      newListing,
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
  const { minRatingClicked, startingPriceClicked, minGuestsClicked } = req.body;
  try {
    var listings;
    var filterClicked = minRatingClicked || startingPriceClicked; // or minGuestsClicked
    if (filterClicked) {
      listings = await Listing.find({
        'rating.user': { $gte: req.body.minRating },
        price: { $gte: req.body.startingPrice },
      });
    } else if (minGuestsClicked) {
      // ideally want to get rid of this part
      listings = await Listing.find({
        'rating.user': { $gte: req.body.minRating },
        price: { $gte: req.body.startingPrice },
        'details.maxpeople': { $gte: req.body.minGuests }, // doesn't work since this field is a String
      });
    } else {
      console.log('no listings have been specified');
      listings = await Listing.find({});
    }
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

/* Get all listings belonging to user */
router.get('/byUserId', requireUserAuth, async (req, res) => {
  try {
    const userListings = await Listing.find({ userId: req.user._id });
    if (!userListings) {
      res.status(404).json({
        errors: ['There are currently no listings! Please try again later.'],
      });
    } else {
      res.status(200).json({
        userListings,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ['Error occurred while getting listings. Please try again!'],
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
                ${
                  req.user.name
                } has accepted your invitation! You will no longer have access to the following listing(s):
                  ${listingEmailBody.join('\n')}
              `,
            html: `
                <p>
                  ${
                    req.user.name
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
                ${
                  req.user.name
                } has rejected your invitation. You will retain access to the following listing(s):
                  ${listingEmailBody.join('\n')}
              `,
            html: `
                <p>
                ${
                  req.user.name
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
        Listing.findOne({ _id: req.params.listingId }, (nerr, ndoc) => {
          if (!ndoc) {
            res.status(404).json({
              errors: ['Listing does not exist.'],
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
        });
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

// router.put('/resetCount', (req, res) => {
//   const temp = require('../config/taskScheduler');
//   temp();
//   res.status(200).json({ success: true });
// });

module.exports = router;
