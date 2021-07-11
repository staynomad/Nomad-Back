const { sendReminder } = require("../helpers/reminder.helper");
const Listing = require("../models/listing.model");
const User = require("../models/user.model");
const cron = require("node-cron");
const mongoose = require("mongoose");
const today = new Date();

const DATABASE_URI =
  "mongodb://vhomesgroup:vhomes2019@cluster0-shard-00-00.rmikc.mongodb.net:27017,cluster0-shard-00-01.rmikc.mongodb.net:27017,cluster0-shard-00-02.rmikc.mongodb.net:27017/VHomes?ssl=true&replicaSet=atlas-1wcpgc-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(DATABASE_URI, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var task = cron.schedule(
  "0 8 * * *",
  () => {
    findExpiringListings();
  },
  {
    scheduled: true,
    timezone: "America/Los_Angeles",
  }
);

task.start();
