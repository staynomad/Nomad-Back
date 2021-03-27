import mapbox
import requests
import pymongo
from dotenv import load_dotenv
import os
import json

load_dotenv()

# Connect to Mongodb and Mapbox to geocode
MONGO_URL = os.getenv('DATABASE_URI')
MAPBOX_KEY = os.getenv('MAPBOX_TOKEN')
myclient = pymongo.MongoClient(MONGO_URL)

# Comment/Uncomment the relevant line to update the relevant collection
# mydb =  myclient['VHomes-Production']
mydb = myclient['VHomes']

mycol = mydb['listings']

# Search through the current listings
for x in mycol.find():
    # If the current listing doesn't have any coordinates, add them. 
    if not x.get('coords'):  
        loc = x.get('location')
        
        print("Updating " + loc)

        # Get the address of the listing
        address = loc.get('street') + ' ' + loc.get('city') + ' '  + loc.get('state') + ' '  + loc.get('country') + ' '  + loc.get('zipcode')

        # Query the address and output and get the coordinates
        query = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + address + '.json?access_token=' + MAPBOX_KEY
        output = json.loads(requests.get(query).content)
        features = output.get('features')
        coordinates = features[0].get('geometry').get('coordinates')
        
        lat = coordinates[0]
        lng = coordinates[1]

        # Get the id of the listing
        currID = x.get('_id')
        
        # Update the listing
        mycol.update_one(
            { '_id': currID},
            { '$set': { 'coords': { 'listingLat': lat, 'listingLng': lng }}}
        )

print("All coordinates updated!")