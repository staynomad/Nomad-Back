from pymongo import MongoClient

client = MongoClient("mongodb://vhomesgroup:vhomes2019@cluster0-shard-00-00.rmikc.mongodb.net:27017,cluster0-shard-00-01.rmikc.mongodb.net:27017,cluster0-shard-00-02.rmikc.mongodb.net:27017/VHomes?ssl=true&replicaSet=atlas-1wcpgc-shard-0&authSource=admin&retryWrites=true&w=majority")
mydb = client['Staging']
mycol = mydb['users']

mycol.remove()

print("db cleaned!")
