const { sendReminder } = require("../helpers/reminder.helper");
const Listing = require("../models/listing.model");
const User = require("../models/user.model");
const cron = require("node-cron");
const today = new Date(); 




// var task = cron.schedule("* * * * *", () => {
//     console.log("hi");
// },{
//     scheduled: true,
//     timezone: "America/Los_Angeles"
// });

// sendReminder("nishantb1130@gmail.com", "name"); 


// TESTING ****************************************************************************************************************

// async function getListing () {
//     const cursor = Listing.find({});
//     console.log("async");
//     for await (const doc of cursor) {
//       console.log(doc);
//     }
// }

// getListing()

async function getListing () {
  for await (const doc of Listing.find({})) {
    console.log(doc); // Prints documents one at a time
  }
}

getListing()


// ****************************************************************************************************************




// cron.schedule("0 8 * * *", () => {
// var task = cron.schedule("* * * * *", () => {
    // console.log("here"); 
    // Listing.findOne({ title: "Beautiful apartment overlooking the park" }, (err, listings) => {

    //     console.log(listing); 
    //     // min number of days to send the email
    //     const week = 7;
    //     const convertMilli = 1000; 
    //     const convertSecMin = 60; 
    //     const convertHour = 24; 

    //     console.log('CONSTANDOIAHOIAHIOFHDSOGI:SHD:GOSIGHD:SDGO')

        // if(err){
        //     console.log("error"); 
        //     console.log(err); 
        //     return err; 
        // }
        // listings.map(listing => {
        //     console.log("urmum"); 
        //     // Check if listing has a user associated with it 
        //     if(listing.userId !== undefined){

        //         // Get the difference between the dates
        //         let listDate = new Date(listing.available[1]);
        //         const diffTime = Math.abs(today - listDate);
        //         const diffDays = Math.ceil(diffTime / (convertMilli * convertSecMin * convertSecMin * convertHour));

        //         // Send reminder if within a week and a reminder hasn't been sent already. 
        //         // if(diffDays <= week && listing.reminder != true){

        //             // Find the associated user
        //             let user = User.findOne(userId);
        //             // let email = user.email;
        //             let email = "nishantb1130@gmail.com"; 

        //             // Send the reminder 
        //             sendReminder(email, listing.title)

        //             // Mark reminder as sent 
        //             listing.reminder = true; 
        //             listing.save()
        //         // }
        //     }
        // })
//     })
// },{
//     scheduled: true,
//     timezone: "America/Los_Angeles"
// })

// task.start();
// console.log("works");

// if listing expires in a week, send an email
//   - go through all the listings
//   - check if each listing that is a week away (only one for each listing) from expiration
//   - send a mail to the user that corresponds to listing for each listing that is about to expire
//   - repeat for each listing