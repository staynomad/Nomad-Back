
const DataBase

const faker = require("faker");
const mongoose = require("mongoose");


function randomIntFromInterval(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomBool() {
    return randomIntFromInterval(0,1) === 1;
}

mongoose.connect(DATABASE_URI, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
}
    try {
        await client.connect();
        console.log("Connected correctly to server");

        const user = require("../models/user.model");

        user.drop();

        for(let i = 0; i<10; i++)
        {
            const user = {}
            user.name = faker.name.findName();
            user.email = faker.internet.email();
            user.password = "$2a$10$F5XvrA99hPKWs11YZmsZ4.C7KFXcP.B1W0h9T4ACTg14Eyq/IXg4K" //this corresponds to Password123!
            user.isHost = randomBool()
            user.friends = []
            user.profileImg = faker.image.imageUrl();
            user.isVerified = user.isHost ? randomBool() : null;
            user.isPublic = user.isHost ? randomBool() : false;
            user.stripeId = null
            collection.insert(user);
        }

        console.log("Database seeded! :)");
        client.close();
    } catch (err) {
        console.log(err.stack);
    }
}
