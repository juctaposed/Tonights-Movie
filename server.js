// Basic requirements for our program to run
const express = require('express')
const app = express()
const cors = require('cors')
//going into our dependency and grabbing mongoclient and objectid at the same time so we can grab stuff by id 
const {MongoClient, ObjectId} = require('mongodb')
const { response } = require('express')
require('dotenv').config()
const PORT = 8000

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName ='sample_mflix',
    collection 

    // Mongo connection boiler
MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log('Connected to the database')
        db = client.db(dbName)
        collection = db.collection('movies') //allows server to connect to db
    })
// Middleware
app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use(cors())
// Methods for Requests to our Server

//Get request for user to read database as they're typing out movie titles
app.get("/search", async (req,res) => {
    try {
        let result = await collection.aggregate([//wait for our result to aggregate data together
            {
                "$Search" : { //tell mongo to search
                    "autocomplete" : { //type of search
                        "query": `${request.query.query}`, //our search query
                        "path": "title", 
                        "fuzzy": { //search type
                            "maxEdits": 2, //our user can make 2 spelling errors/characters when searching for a movie and we'll substitute missing or wrong characters
                            "prefixLength": 3 //user needs to type atleast 3 characters
                        }
                    }
                }
            }
        ]).toArray() //dump the return into array so our JS knows what to do with it
        res.send(result)
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})
//Get request once user clicks, using id as a parameter
app.get("/get/:id" , async(req,res) => {
    try {
        let result = await collection.findOne({
            "_id" : ObjectId(req.params.id) //passing in id

        })
        res.send(result) //send the movie info from mongo to our app
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})
    //connect app to server/port
app.listen(process.env.PORT || PORT, () => {
    console.log('Server is running')
})