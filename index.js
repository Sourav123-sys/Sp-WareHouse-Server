
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

   // add a new item in db
   app.post('/item', async (req, res) => {

    const newItem = req.body;
    
    const result = await itemsCollection.insertOne(newItem);
    res.send(result)
})

        // get items from db
        app.get('/items', async (req, res) => {
            const query = {}
            const cursor = itemsCollection.find(query)

            const items = await cursor.toArray()
            res.send(items)
        })

        // get by id
        app.get('/items/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const item = await itemsCollection.findOne(query)
            res.send(item)
        })

        //update
        app.put('/items/:id', async (req, res) => {
            const id = req.params.id
            const updateItem = req.body
            console.log(updateItem);
            const query = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                   
                    quantity: updateItem.quantity
                }
            }

            const result = await itemsCollection.updateOne(query, updateDoc, options)
            res.send(result);
        })
// deliver update

app.put('/items/deliver/:id', async (req, res) => {
    const id = req.params.id
    const newQuantity = req.body
    const deliver = newQuantity.quantityUpdate-1
   // console.log(newQuantity.quantityUpdate-1,'ss');
    const query = { _id: ObjectId(id) }
    const options = { upsert: true };
    const updateDoc = {
        $set: {
            quantity: deliver
        }
    }

    const result = await itemsCollection.updateOne(query, updateDoc, options)
    res.send(result);
})
           //delete 
           app.delete('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await itemsCollection.deleteOne(query)
            res.send(result);
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