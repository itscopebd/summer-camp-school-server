const express = require("express");
const app = express();
require('dotenv').config();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// midleware 

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Server is Running")
})








const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.loltiyt.mongodb.net/?retryWrites=true&w=majority`;

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

    const allDataCollection = client.db("yago").collection("cource");
    const cartsCollection = client.db("yago").collection("carts");
    const usersCollection = client.db("yago").collection("users");


    app.get("/alldata", async (req, res) => {
      const result = await allDataCollection.find().toArray();
      res.send(result)

    })





    // users api 

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result)
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { userEmail: user.userEmail }
      const filterUser = await usersCollection.findOne(query);
      if (filterUser) {
        return res.send({ message: "User Already Exist!" })

      }
      else {
        const result = usersCollection.insertOne(user);
        res.send(result)
      }
    })

    app.delete("/users/delete/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const result = await usersCollection.deleteOne(filter);
      res.send(result)
    })



// make admin 

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const filter = { _id: new ObjectId(id) }
      const updateData = {
        $set: {
          role: 'admin'
        }
      }
      const result = await usersCollection.updateOne(filter, updateData);
      res.send(result)
    })

    // make instructor

    app.patch("/users/instructor/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateData = {
        $set: {
          role: 'instructor'
        }
      }
      const result = await usersCollection.updateOne(filter, updateData);
      res.send(result)
    })




    // carts api 

    app.post("/carts", async (req, res) => {
      const data = req.body;
      const query = { id: data.id }
      const filterData = await cartsCollection.findOne(query);

      if (filterData) {
        return res.send({ message: "Already Selected!" })
      }

      const result = await cartsCollection.insertOne(data);
      res.send(result)
    })








    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);







app.listen(port, () => {
  console.log("Server Runnig.....")
})




