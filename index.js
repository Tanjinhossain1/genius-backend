const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ja3y1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        await client.connect()
        const serviceCollection = client.db("geniusCar").collection("services");
        // get service 
        app.get('/service', async (req, res)=>{
            const query = {}
            const cursor = serviceCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })
        // get service with id 
        app.get('/service/:id', async (req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await serviceCollection.findOne(query);
            res.send(result)
        })

        // Post services 
        app.post('/service', async (req, res)=>{
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            console.log(newService)
            res.send(result)
        })

        // delete Service 
        app.delete('/service/:id', async (req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })


    }
    finally{
        // client.close();
    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('genius car service server connect done')
})


app.listen(port, () => {
    console.log('port connect')
})