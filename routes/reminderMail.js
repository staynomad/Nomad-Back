const { sendReminder } = require("../helpers/reminder.helper");
const Listing = require("../models/listing.model");
const User = require("../models/user.model")
const cron = require("node-cron");
const mongoose = require("mongoose");
const today = new Date(); 

const DATABASE_URI  = 'mongodb://vhomesgroup:vhomes2019@cluster0-shard-00-00.rmikc.mongodb.net:27017,cluster0-shard-00-01.rmikc.mongodb.net:27017,cluster0-shard-00-02.rmikc.mongodb.net:27017/VHomes?ssl=true&replicaSet=atlas-1wcpgc-shard-0&authSource=admin&retryWrites=true&w=majority'
mongoose.connect(DATABASE_URI, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var task = cron.schedule("0 8 * * *", () => {
  findExpiringListings();
},{
    scheduled: true,
    timezone: "America/Los_Angeles"
});

task.start()

async function findExpiringListings () {
  try{
    for await (const listing of Listing.find({})) {
      if (listing.userId !== undefined && listing.reminder != true){

        const week = 7;
        const convertMilli = 1000; 
        const convertSecMin = 60; 
        const convertHour = 24; 
        
        let listDate = new Date(listing.available[1]);
        const diffTime = Math.abs(today - listDate);
        const diffDays = Math.ceil(diffTime / (convertMilli * convertSecMin * convertSecMin * convertHour));

        // Send reminder if within a week of expiration.
        if(diffDays <= week){

          // Find the associated user.
          let user = User.findOne(listing.userId);
          let email = user.email;

          // Send the reminder.
          sendReminder('stanxy357@gmail.com', listing.title)

          // Mark reminder as sent.
          listing.reminder = true; 
          listing.save()
        }
      }
    }
    
  } catch(err){
    console.log(err)
  }
}

// if listing expires in a week, send an email to host
//   - go through all the listings
//   - check if each listing that is a week away (only one for each listing) from expiration
//   - send a mail to the user that corresponds to listing for each listing that is about to expire
//   - repeat for each listing
//   - listings that have already been sent a reminder about their expiration should not receive additional reminders
// this process should repeat every day at 8:00 am PST