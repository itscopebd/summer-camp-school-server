const express= require("express");
const app= express();
require('dotenv').config();
const cors = require("cors");
const port= process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
// midleware 

app.use(cors())
app.use(express.json())

app.get("/",(req,res)=>{
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

    const allDataCollection= client.db("yago").collection("cource");


app.get("/alldata", async(req,res)=>{
    const result= await allDataCollection.find().toArray();
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







app.listen(port,()=>{
    console.log("Server Runnig.....")
})




