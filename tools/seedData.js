/* mySeedScript.js */
const DataBase
// require the necessary libraries
const faker = require("faker");
const MongoClient = require("mongodb").MongoClient;


function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomBool() { 
    return randomIntFromInterval(0,1) === 1;
}

async function seedDB() {
    // Connection URL
    const uri = "YOUR MONGODB ATLAS URI";

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        // useUnifiedTopology: true,
    });

    try {
        await client.connect();
        console.log("Connected correctly to server");

        const collection = client.db(DataBase).collection("Users");

        // The drop() command destroys all data from a collection.
        // Make sure you run it against proper database and collection.
        collection.drop();

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

seedDB();
