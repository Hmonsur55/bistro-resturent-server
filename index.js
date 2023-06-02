const express = require("express")
const app = express()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// meddlewear 
app.use(cors())
app.use(express.json()) 



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.9cknc8q.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      const menuCollection = client.db("bistroDB").collection("menu");
      const reviewsCollection = client.db("bistroDB").collection("reviews");
    const cartCollection = client.db("bistroDB").collection("carts");
    const userCollection = client.db("bistroDB").collection("users");
// all user get apis
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result)
    })
    // User Collection API. and if login with google restric existing user 
    // this will help from duplicate user data check Social login  also 
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      console.log(existingUser)
      if (existingUser) {
        return res.send({message: 'user already exist'})
      }
      const result = await userCollection.insertOne(user)
      res.send(result)
    })

    // user role change api 
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          role: 'admin'
        },
      }
        const result = await userCollection.updateOne(filter, updatedDoc)
      res.send(result)

    });
    // app.delete('/users/admin/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await cartCollection.deleteOne(query);
    //   res.send(result);
    // });

      // menu Collection API
      app.get('/menu', async (req, res) => {
          const result = await menuCollection.find().toArray();
          res.send(result)
      })
    // Reveiw collection API
      app.get('/reviews', async (req, res) => {
          const result = await reviewsCollection.find().toArray();
          res.send(result)
      })

    // cart collection  API
    app.get('/carts', async (req, res) => {
      const email = req.query.email
      if (!email) {
        res.send ([])
      }
      const query = { email: email };
      const result = await cartCollection.find(query).toArray()
      res.send(result)
    })

    app.post('/carts', async (req, res) => {
      const item = req.body;
      console.log(item)
      const result = await cartCollection.insertOne(item)
      res.send(result)
    })
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Bistro boss is running ')
})

app.listen(port, () => {
    console.log(`bistro boos is running on port : ${port}`)
})