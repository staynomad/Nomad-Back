import csv
from faker import Faker
import random
import time
import os
import pandas as pd
from pymongo import MongoClient
import json

def randomBool():
    return random.randint(0, 1) == 1

def datagenerate(records, headers):
    fake = Faker('en_US')
    with open("Seed_data.csv", 'wt') as csvFile:
        writer = csv.DictWriter(csvFile, fieldnames=headers)
        writer.writeheader()
        for i in range(records):
            writer.writerow({
                        "name" : fake.name(),
                        "email" : fake.email(),
                        "password" : "$2a$10$F5XvrA99hPKWs11YZmsZ4.C7KFXcP.B1W0h9T4ACTg14Eyq/IXg4K",
                        "isHost" : randomBool(),
                        "friends" : "...",
                        "profileImg" : fake.image_url(),
                        "isVerified" : randomBool() if "isHost" else None,
                        "isPublic" : randomBool() if "isHost" else False,
                        "stripeId" : None
                        })

if __name__ == '__main__':
    records = 100
    headers = ["name", "email", "password", "isHost", "friends", "profileImg", "isVerified", "isPublic", "stripeId"]
    datagenerate(records, headers)
    print("CSV generation complete!")

time.sleep(3)

#This is where the database gets seeded

client = MongoClient("mongodb://vhomesgroup:vhomes2019@cluster0-shard-00-00.rmikc.mongodb.net:27017,cluster0-shard-00-01.rmikc.mongodb.net:27017,cluster0-shard-00-02.rmikc.mongodb.net:27017/VHomes?ssl=true&replicaSet=atlas-1wcpgc-shard-0&authSource=admin&retryWrites=true&w=majority")
mydb = client['Staging']
mycol = mydb['users']

data = pd.read_csv("../tools/Seed_data.csv")
payload = json.loads(data.to_json(orient='records'))
mycol.remove()
mycol.insert_many(payload)

os.remove("Seed_data.csv")
print("csv Removed!")
