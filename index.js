const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require("stripe")(process.env.stripe_key)
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// midleware 

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Server is Running")
})


const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {

    return res.status(401).send({ error: true, message: "unauthorization accesssddds" })

  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: "unauthorization access" })
    }
    req.decoded = decoded;
    next()
  })
}





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

    const courceCollection = client.db("yago").collection("cource");
    const cartsCollection = client.db("yago").collection("carts");
    const usersCollection = client.db("yago").collection("users");

    // JWT

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const access_token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
      res.send({ access_token })
    })


    app.get("/alldata", async (req, res) => {
      const result = await courceCollection.find().toArray();
      res.send(result)

    })





    // users api 

    app.get("/users", async (req, res) => {

      const result = await usersCollection.find().toArray();
      res.send(result)
    })


    app.get("/users/roleCheck/:email", async (req, res) => {



      query = { userEmail: req.query.email }

      const result = await usersCollection.findOne(query);

      res.send(result)


    })

    app.get("/users/instructors", async (req, res) => {

      const query = { role: { $in: ['instructor'] } }
      const result = await usersCollection.find(query).toArray()
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



    // cource make by instructor 

    app.post("/cource", async (req, res) => {
      const newItem = req.body;
      const result = await courceCollection.insertOne(newItem);
      res.send(result)
    })


    // get cources data 
    app.get("/cource", async (req, res) => {
      // const query = { status: { $in: ['approved'] } }
      const result = await courceCollection.find().toArray();
      res.send(result)
    })
    app.get("/cource/client", async (req, res) => {
      const query = { status: { $in: ['approved'] } }
      const result = await courceCollection.find(query).toArray();
      res.send(result)
    })


    // approved instructor cources by admin 

    app.patch("/cource/approve/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          status: "approved"
        }
      }
      const result = await courceCollection.updateOne(query, update);
      res.send(result)
    })

    // Denied instructor cources by admin 

    app.patch("/cource/denied/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          status: "denied"
        }
      }
      const result = await courceCollection.updateOne(query, update);
      res.send(result)
    })



    // carts api 


    app.get('/carts/:email', async (req, res) => {

      const query = { userEmail: req.params.email };
      const result = await cartsCollection.find(query).toArray();
      res.send(result)

    })



    app.delete("/carts/delete/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await cartsCollection.deleteOne(query);
      res.send(result)


    })



    app.post("/carts", async (req, res) => {
      const data = req.body;
      const query = { id: data.id  }
      const filterData = await cartsCollection.findOne(query);

      if (filterData) {
        return res.send({ message: "Already Selected!" })
      }

      const result = await cartsCollection.insertOne(data);
      res.send(result)
    })

    // check user admin 
    app.get("/users/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;

      if (req.decoded.email !== email) {
        res.send({ admin: false })

      }
      const query = { userEmail: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === 'admin' }
      res.send(result)
    })

    // check user instructor 

    app.get("/users/instructor/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;

      if (req.decoded.email !== email) {
        res.send({ instructor: false })

      }
      const query = { userEmail: email };
      const user = await usersCollection.findOne(query);
      const result = { instructor: user?.role === 'instructor' }
      res.send(result)
    })

    // create payment 

    app.post("/payment", async (req, res) => {
      const { price } = req.body;
      const amount = price * 100;
      console.log(price)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ['card']
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
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




