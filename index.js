const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorize access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        console.log(decoded)
        req.decoded = decoded
        next();
    })
}
// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).send({ message: 'unauthorized access' });
//     }
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(403).send({ message: 'Forbidden access' });
//         }
//         console.log('decoded', decoded);
//         req.decoded = decoded;
//         next();
//     })
// }
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ja3y1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect()
        const serviceCollection = client.db("geniusCar").collection("services");
        const orderCollection = client.db("geniusCar").collection("order");
        // get service 
        app.get('/service', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })
        // get service with id 
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await serviceCollection.findOne(query);
            res.send(result)
        })

        // Post services 
        app.post('/service', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            console.log(newService)
            res.send(result)
        })
        // PUT service 
        app.put('/service/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateUser = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateUser.name,
                    description: updateUser.description,
                    price: updateUser.price,
                    img: updateUser.img,
                },
            };
            const result = await serviceCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })
        // delete Service 
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })
        // order section 
        app.get('/order', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }
            else{
                res.status(403).send({message: 'forbidden access'})
            }
        })
        // app.get('/order', verifyJWT, async (req, res) => {
        //     console.log(req.decoded)
        //     const decodedEmail = req.decoded.email;
        //     const email = req.query.email;
        //     console.log(email, decodedEmail)
        //     if (email === decodedEmail) {
        //         const query = { email: email };
        //         console.log(query)
        //         const cursor = orderCollection.find(query);
        //         const result = await cursor.toArray()
        //         res.send(result)
        //     }
        // })
        app.post('/order', async (req, res) => {

            const query = req.body;
            const order = await orderCollection.insertOne(query);

            res.send(order)
        })

        // access token 
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            });
            res.send({ accessToken })
        })
    }
    finally {
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