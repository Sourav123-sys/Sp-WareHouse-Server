
//import
const express = require('express');
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
const port = process.env.PORT || 4000
const jwt = require('jsonwebtoken');

//middleware
app.use(bodyParser.json())
app.use(cors())

//connect to db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eowzq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {

        await client.connect();
        const itemsCollection = client.db('SP-Warehouse').collection('items')
        console.log("sp db connected")



// get items from db
app.get('/items', async (req, res) => {
    const query = {}
    const cursor = itemsCollection .find(query)

    const items = await cursor.toArray()
    res.send(items)
})

       
    }
    finally {

    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('sp-warehouse is connected!')

})

//check 
app.listen(port, () => {
    console.log(`server is running ${port}`)
})