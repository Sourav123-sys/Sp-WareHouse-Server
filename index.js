
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


function checkJwt(req, res, next) {
    const hederAuth = req.headers.authorization
    if (!hederAuth) {
        return res.status(401).send({ message: 'unauthorized access.try again' })
    }
    else {
        const token = hederAuth.split(' ')[1]
        console.log({token});
        jwt.verify(token,process.env.ACCESS_JWT_TOKEN, (err, decoded) => {
            if (err) {
                console.log(err);
                return res.status(403).send({ message: 'forbidden access' })
            }
            console.log('decoded', decoded);
            req.decoded = decoded;
            next()
        })
    }
    console.log(hederAuth, 'inside chckjwt');
   
}


//connect to db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eowzq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

console.log(process.env.ACCESS_JWT_TOKEN);

async function run() {
    try {

        await client.connect();
        const itemsCollection = client.db('SP-Warehouse').collection('items')
        console.log("sp db connected")




        app.post('/signin', async (req, res) => {
            const user = req.body;
            console.log(req.body,'user')
            
            const getToken = jwt.sign(user, process.env.ACCESS_JWT_TOKEN, {
                expiresIn: '1d'
            });
           
            res.send({ getToken });

        })



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

            const allItems = await cursor.toArray()
            res.send(allItems)
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
                    quantity: updateItem.newQuantityIncrease
                }
            }

            const result = await itemsCollection.updateOne(query, updateDoc, options)
            res.send(result);
        })
// deliver update

app.put('/deliver/:id', async (req, res) => {
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
           // get items by email 
           app.get('/singleItem', checkJwt, async (req, res) => {
            const decodedEmail = req.decoded.email
            const email = req.query.email
            if (email === decodedEmail) {
                const query = { email: email }
            const cursor = itemsCollection.find(query)
            const items = await cursor.toArray()
            res.send(items)
            }
            else {
                return res.status(403).send({ message: 'forbidden access' })
            }
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