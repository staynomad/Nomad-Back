const express = require("express");
const mongoose = require("mongoose");
const { baseURL } = require("../config/index");
const {
  sendConfirmationEmail,
  sendTransferAccept,
  sendTransferRejection,
} = require("../helpers/emails.helper");
const Listing = require("../models/listing.model");
const { getUserInfo, stateOptions } = require("../utils");
const {
  deleteImagesFromAWS,
  uploadImagesToAWS,
} = require("../helpers/photos.helper");
const popularity = require("../models/popularity.model");

const fs = require("fs");
const ics = require("ics");
const Housekeeping = require("../models/housekeeping.model");
const User = require("../models/user.model");

const createListing = async (req, res) => {
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
      coordinates,
    } = JSON.parse(req.files["listingData"][0].buffer.toString()).newListing;

    const imageUploadRes = await uploadImagesToAWS(req.files["image"]);

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
        }
      }
    }

    const newListingData = {
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
    };

    if (
      coordinates &&
      coordinates !== null &&
      coordinates.lng !== null &&
      coordinates.lat !== null
    )
      newListingData.coords = coordinates;
    else delete newListingData.coords;
    const newListing = await new Listing(newListingData).save();

    // index the listing to elastic search
    // await insertIndex(listingIndex, listingType, convertListing(newListing));

    // Need to talk about return values, validation, etc.
    res.status(201).json({
      newListingId: newListing._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ["Error occurred while creating listing. Please try again!"],
    });
  }
};

const activateListing = async (req, res) => {
  try {
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.listingId },
      { $set: { active: true } },
      { returnNewDocument: true }
    );
    if (!listing) {
      return res.status(400).json({
        error: "Listing does not exist. Please try again.",
      });
    }

    const userInfo = await getUserInfo(req.user._id);

    sendConfirmationEmail(userInfo.name, userInfo.email, req.params.listingId);

    // update the housekeeping collection that keeps track of the number of active listings
    const curr = new Date();
    const field = curr.getMonth() + 1 + "/" + curr.getDate();
    await Housekeeping.findOneAndUpdate(
      { name: "activeListings" },
      { $inc: { ["payload." + field]: 1 } }
    );

    return res.status(200).json({
      message: "Successfully activated listing",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error occurred while activating listing. Please try again!",
    });
  }
};

const deactivateListing = async (req, res) => {
  try {
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.listingId },
      { $set: { active: false } },
      { returnNewDocument: true }
    );
    if (!listing) {
      return res.status(400).json({
        error: "Listing does not exist. Please try again.",
      });
    }
    return res.status(200).json({
      message: "Successfully activated listing",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error occurred while deactivating listing. Please try again!",
    });
  }
};

const editListing = async (req, res) => {
  try {
    const listing = await Listing.findOne({
      _id: req.params.listingId,
      userId: req.user._id,
    });

    if (!listing) {
      res.status(404).json({
        errors: ["Listing was not found. Please try again!"],
      });
    } else {
      const dataToUpdate = JSON.parse(
        req.files["listingData"][0].buffer.toString()
      ).editedListing;
      const imageUploadRes = await uploadImagesToAWS(req.files["image"]);

      const updatedKeys = Object.keys(dataToUpdate);
      updatedKeys.forEach(async (key) => {
        if (
          key &&
          key !== null &&
          listing[key] !== dataToUpdate[key] &&
          key !== "listingId"
        ) {
          console.log("changing " + key);
          listing[key] = dataToUpdate[key];
        }
      });

      if (imageUploadRes && imageUploadRes.length > 0)
        listing.pictures = [...listing.pictures, ...imageUploadRes];

      await listing.save();
      res.status(200).json({
        listing,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ["Error occurred while creating listing. Please try again!"],
    });
  }
};

const editListingImages = async (req, res) => {
  try {
    const listing = await Listing.findOne({
      _id: req.params.listingId,
      userId: req.user._id,
    });

    if (!listing) {
      res.status(404).json({
        errors: ["Listing was not found. Please try again!"],
      });
    } else {
      const { imageURLs } = req.body;
      const { pictures } = listing;

      let newPhotoArr = [];

      for (let i = 0; i < pictures.length; i++) {
        const currentPhotoURL = pictures[i];
        if (imageURLs.includes(currentPhotoURL)) continue;
        else newPhotoArr.push(currentPhotoURL);
      }

      console.log(imageURLs);

      await deleteImagesFromAWS(imageURLs);
      listing.pictures = newPhotoArr;

      await listing.save();
      res.status(200).json({
        success: true,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [
        "Error occurred while removing image from listing. Please try again!",
      ],
    });
  }
};

const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find({});
    if (!listings) {
      res.status(404).json({
        errors: ["There are currently no listings! Please try again later."],
      });
    } else {
      res.status(200).json({
        listings,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ["Error occurred while getting listings. Please try again!"],
    });
  }
};

const getActiveListings = async (req, res) => {
  try {
    const listings = await Listing.find({ active: true });
    if (!listings) {
      res.status(404).json({
        errors: ["There are currently no listings! Please try again later."],
      });
    } else {
      res.status(200).json({
        listings,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ["Error occurred while getting listings. Please try again!"],
    });
  }
};

const getFilteredListings = async (req, res) => {
  try {
    /* Filter variables passed from front */
    const filters = req.body;
    let queryObj = {};

    /* Create the query object based on the filterParams passed in */
    for (const filterParam in filters) {
      if (filters[filterParam].length === 0) continue;
      else {
        /* Check if country or state matches value passed (same dropdown value as form) */
        if (filterParam === "country" || filterParam === "state") {
          queryObj[`location.${filterParam}`] = filters[filterParam];
        }
        /* Price less than or equal to maxPrice */
        if (filterParam === "maxPrice")
          queryObj.price = { $lte: parseFloat(filters[filterParam], 10) };
        /* Max number of guests greater than or equal to minGuests*/
        if (filterParam === "minGuests")
          queryObj[`details.maxpeople`] = {
            $gte: parseFloat(filters[filterParam], 10),
          };
        /* Checks the description, location, and title to see if any of them contain the search term */
        if (filterParam === "search") {
          const stateToCheck = stateOptions.find((ele) =>
            ele.label.toLowerCase().includes(filters[filterParam].toLowerCase())
          );

          queryObj.$or = [
            { description: { $regex: filters[filterParam], $options: "i" } },
            {
              "location.city": { $regex: filters[filterParam], $options: "i" },
            },
            {
              "location.state": { $regex: filters[filterParam], $options: "i" },
            },
            {
              "location.zipcode": {
                $regex: filters[filterParam],
                $options: "i",
              },
            },
            { title: { $regex: filters[filterParam], $options: "i" } },
          ];

          if (stateToCheck) {
            queryObj.$or.push({
              "location.state": { $regex: stateToCheck.value, $options: "i" },
            });
          }
        }
      }
    }

    await Listing.find(queryObj, (err, listingDocs) => {
      if (err || !listingDocs || listingDocs.length === 0) {
        res.status(404).json({
          errors: [
            "No listings found with the given filter(s).  Please try again!",
          ],
        });
      } else {
        res.status(200).json(listingDocs);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ["Error occurred while getting listings. Please try again!"],
    });
  }
};

const getListingsByRadius = async (req, res) => {
  try {
    await Listing.find({}, (err, listingDocs) => {
      if (err || !listingDocs) {
        res.status(404).json({
          errors: ["There are currently no listings! Please try again later."],
        });
      } else {
        // Radius will be in kilometers
        const { lat, lng, radiusInKilometers } = req.query;

        const listingsInRadius = listingDocs.filter((listing) => {
          if (
            !listing.coords ||
            !listing.coords.listingLat ||
            !listing.coords.listingLng ||
            !listing.active
          )
            return false;
          else {
            const { listingLat, listingLng } = listing.coords;
            const listingLatConverted = parseFloat(listingLat, 10);
            const listingLngConverted = parseFloat(listingLng, 10);

            const ky = 40000 / 360;
            const kx = Math.cos((Math.PI * lat) / 180.0) * ky;
            const dx = Math.abs(lng - listingLngConverted) * kx;
            const dy = Math.abs(lat - listingLatConverted) * ky;

            return Math.sqrt(dx ** 2 + dy ** 2) <= radiusInKilometers;
          }
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
};

const getByUserIdFunc = async (userId) => {
  return await Listing.find({ userId: userId }).catch((err) => {
    return err;
  });
};

const getListingsByUser = async (req, res) => {
  const userListings = await getByUserIdFunc(req.params.userId);
  if (userListings instanceof Error) {
    return res.status(500).json({
      errors: "Error occured while getting popular listings",
    });
  }
  if (!userListings) {
    return res.status(404).json({
      errors: ["There are currently no listings! Please try again later."],
    });
  } else {
    return res.status(200).json({
      userListings,
    });
  }
};

const getListingsByID = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      res.status(404).json({
        errors: ["Listing does not exist."],
      });
    } else {
      res.status(200).json({
        listing,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ["Error occurred while getting listings. Please try again!"],
    });
  }
};

const getListingsBySearch = async (req, res) => {
  const { itemToSearch } = req.body;
  try {
    let decodedItemToSearch = decodeURI(itemToSearch).toLowerCase();
    const filteredListings = await Listing.aggregate([
      {
        $search: {
          index: "listing-search-index",
          text: {
            query: decodedItemToSearch,
            path: {
              wildcard: "*",
            },
            fuzzy: {},
          },
        },
      },
      { $match: { active: true } },
    ]);

    if (filteredListings.length === 0) {
      return res.status(404).json({
        errors: ["There were no listings found with the given search term."],
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
        "Error occurred while searching for listings. Please try again!",
      ],
    });
  }
};

const deleteListingByID = async (req, res) => {
  try {
    const listing = await Listing.findOne({
      _id: req.params.listingId,
      userId: req.user._id,
    });

    if (!listing) {
      res.status(500).json({
        errors: ["Listing was not found. Please try again!"],
      });
    } else {
      listing.remove();
      res.status(200).json({
        message: ["Listing was removed."],
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: [
        "Error occurred while attempting to remove listing. Please try again.",
      ],
    });
  }
};

const syncListingsByID = async (req, res) => {
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
          error: "Listing does not exist. Please try again.",
        });
      }
    }
    return res.status(200).json({
      message: "Successfully updated listing availability",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error:
        "Error occurred while attempting to sync listing. Please try again.",
    });
  }
};

const getTransferRequests = async (req, res) => {
  try {
    const listingsToTransfer = await Listing.find({
      "transferEmail.to": req.user.email,
    });
    if (!listingsToTransfer) {
      res.status(404).json({
        errors: ["No listing transfer request(s) found."],
      });
    } else {
      res.status(200).json({
        listingsToTransfer,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ["An error occurred while searching for listing transfers."],
    });
  }
};

const sendTransferRequest = async (req, res) => {
  try {
    const { email, listingId } = req.body;

    const user = await User.findOne({ email: email });

    const transferEmail = { from: req.user.email, to: email };
    const listingToTransfer = await Listing.findOneAndUpdate(
      { _id: listingId },
      { transferEmail }
    );
    if (!listingToTransfer) {
      return res.status(404).json({
        errors: "Listing could not be found.",
      });
    } else {
      sendTransferInvite(user.name, email, req.user.name);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      errors: ["Error transferring listing. Please try again!"],
    });
  }
};

const acceptTransferRequest = async (req, res) => {
  try {
    const { acceptAll, listingId } = req.body;

    if (acceptAll) {
      const listingsToTransfer = await Listing.find({
        "transferEmail.to": req.user.email,
      });
      if (!listingsToTransfer) {
        res.status(404).json({
          errors: ["No listing transfer request(s) found."],
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
          const sendUser = await User.findOne({ email: email });

          sendTransferAccept(
            sendUser.name,
            email,
            req.user.name,
            req.user.email,
            listingEmailBody
          );
        });

        res.status(200).json({
          listingsToTransfer,
        });
      }
    } else {
      const listingToTransfer = await Listing.findById(listingId);
      if (!listingToTransfer) {
        return res.status(404).json({
          errors: "Listing could not be found.",
        });
      } else {
        const emailToSendTo = listingToTransfer.transferEmail.from;
        listingToTransfer.userId = mongoose.Types.ObjectId(req.user._id);
        listingToTransfer.transferEmail = {};
        await listingToTransfer.save();
        const sendUser = await User.findOne({ email: emailToSendTo });

        let listings = [];
        listings.push(listingToTransfer);

        sendTransferAccept(
          sendUser.name,
          emailToSendTo,
          req.user.name,
          req.user.email,
          listings
        );

        res.status(200).json({
          listingToTransfer,
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ["An error occurred while searching for listing transfers."],
    });
  }
};

const rejectTransferRequest = async (req, res) => {
  try {
    const { rejectAll, listingId } = req.body;

    if (rejectAll) {
      const listingsToTransfer = await Listing.find({
        "transferEmail.to": req.user.email,
      });
      if (!listingsToTransfer) {
        res.status(404).json({
          errors: ["No listing transfer request(s) found."],
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

          const sendUser = await User.findOne({ email: email });

          sendTransferRejection(
            sendUser.name,
            email,
            req.user.name,
            req.user.email,
            listingEmailBody
          );
        });

        res.status(200).json({
          listingsToTransfer,
        });
      }
    } else {
      const listingToTransfer = await Listing.findById(listingId);
      if (!listingToTransfer) {
        return res.status(404).json({
          errors: "Listing could not be found.",
        });
      } else {
        let emailToSendTo = listingToTransfer.transferEmail.from;
        listingToTransfer.transferEmail = {};
        await listingToTransfer.save();

        const sendUser = await User.findOne({ email: emailToSendTo });

        let listings = [];
        listings.push(listingToTransfer);

        sendTransferRejection(
          sendUser.name,
          emailToSendTo,
          req.user.name,
          req.user.email,
          listings
        );
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      errors: ["An error occurred while searching for listing transfers."],
    });
  }
};

const incrementListingVisit = (req, res) => {
  currDay = new Date().getDay();
  popularity.findOneAndUpdate(
    { listingId: req.params.listingId },
    {
      $inc: { visitCount: 1, ["visits." + currDay]: 1 },
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
                errors: ["Listing does not exist or listing is not active"],
              });
            } else if (nerr) {
              res.status(500).json({
                errors: ["Error occured while finding corresponding listing"],
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
                      "Error occurred while creating new popularity field. Please try again!",
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
            "Error occurred while incrementing listings. Please try again!",
          ],
        });
      } else {
        res.status(200).json({ success: true });
      }
    }
  );
};

const getPopularFunc = (numberOfListings) => {
  return popularity
    .find({}, null, { sort: { visitCount: -1 }, limit: numberOfListings })
    .catch((err) => {
      return err;
    });
};

const getPopularListings = async (req, res) => {
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
      .json({ errors: "Parameter argument provided should be integers" });
    return;
  }
  try {
    const listings = await getPopularFunc(numberOfListing);
    if (listings.length < 5) {
      const listingSet = new Set();
      for (element of listings) {
        listingSet.add(element.listingId.toString());
      }
      const newListing = await Listing.find({ active: true }).limit(5);
      for (element of newListing) {
        if (!listingSet.has(element._id.toString())) {
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
      .json({ error: "There was an error while getting the popular listings" });
  }
};

const getAllPopularListings = async (req, res) => {
  const listings = await getPopularFunc(0);
  if (listings instanceof Error) {
    res.status(500).json({
      errors: "Error occured while getting popular listings",
    });
  } else {
    res.status(200).json({ listings });
  }
};

const exportListings = async (req, res) => {
  const { userId, listingId, listingCalendar } = req.body;
  var curr = new Date();
  var events = [
    {
      title: "NomΛd Listing",
      description: "UNAVAILABLE",
      url: `${baseURL}/listing/${listingId}`,
      start: [curr.getFullYear(), 1, 1],
      end: [
        listingCalendar.available[0].substring(0, 4),
        listingCalendar.available[0].substring(5, 7),
        listingCalendar.available[0].substring(8),
      ],
    },
    {
      title: "NomΛd Listing",
      description: "UNAVAILABLE",
      url: `${baseURL}/listing/${listingId}`,
      start: [
        listingCalendar.available[1].substring(0, 4),
        listingCalendar.available[1].substring(5, 7),
        listingCalendar.available[1].substring(8),
      ],
      end: [curr.getFullYear() + 1, 12, 31],
    },
  ];
  for (let i = 0; i < listingCalendar.booked.length; i++) {
    events.push({
      title: "NomΛd Listing",
      description: "UNAVAILABLE",
      url: `${baseURL}/listing/${listingId}`,
      start: [
        listingCalendar.booked[i].start.substring(0, 4),
        listingCalendar.booked[i].start.substring(5, 7),
        listingCalendar.booked[i].start.substring(8),
      ],
      end: [
        listingCalendar.booked[i].end.substring(0, 4),
        listingCalendar.booked[i].end.substring(5, 7),
        listingCalendar.booked[i].end.substring(8),
      ],
    });
  }
  ics.createEvents(events, (error, value) => {
    if (error) {
      console.log(error);
    }
    fs.writeFile(
      `./exports/${userId}-${listingId}.ics`,
      value,
      { flag: "w" },
      (err) => {
        if (err)
          return res.status(400).json({
            errors: "Unable to export file.",
          });
        return res
          .status(200)
          .json({ url: `${exportURL}/exports/${userId}-${listingId}.ics` });
      }
    );
  });
};

module.exports = {
  createListing,
  activateListing,
  deactivateListing,
  editListing,
  editListingImages,
  getAllListings,
  getFilteredListings,
  getActiveListings,
  getListingsByRadius,
  getListingsByUser,
  getListingsByID,
  getListingsBySearch,
  deleteListingByID,
  syncListingsByID,
  getTransferRequests,
  sendTransferRequest,
  acceptTransferRequest,
  rejectTransferRequest,
  incrementListingVisit,
  getPopularListings,
  getAllPopularListings,
  exportListings,
};
