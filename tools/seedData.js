
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

        const User = require("../models/user.model");

        await mongoose.connection.collection('users').drop()

        for(let i = 0; i<10; i++)
        {
            const _user = {}
            _user.name = faker.name.findName();
            _user.email = faker.internet.email();
            _user.password = "$2a$10$F5XvrA99hPKWs11YZmsZ4.C7KFXcP.B1W0h9T4ACTg14Eyq/IXg4K" //this corresponds to Password123!
            _user.isHost = randomBool()
            _user.friends = []
            _user.profileImg = faker.image.imageUrl();
            _user.isVerified = user.isHost ? randomBool() : null;
            _user.isPublic = user.isHost ? randomBool() : false;
            _user.stripeId = null
            User.insert(_user);
        }

        console.log("Database seeded! :)");
        client.close();
    } catch (err) {
        console.log(err.stack);
    }
}
