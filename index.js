const express =require('express')
const { MongoClient } = require('mongodb');
require('dotenv').config()
const cors= require('cors')
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

const app= express()

//middlewire
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zf2qb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try{
                // connect database 
                await client.connect()
                const database = client.db("clock-fox")
                const productsCollection = database.collection("products")
                const productsInformationCollection = database.collection("productInformation")
                const reviewCollection = database.collection("reviews")
                const usersCollection = database.collection("users")

// ------------------- product --------------

            // product get api 
                app.get('/products', async(req,res)=>{
                const cursor= productsCollection.find({})
                const products=await cursor.toArray();
                res.json(products)
             })
            // product get api using _id 
            app.get('/products/:id', async (req, res) => {
                const id = req.params.id;
                const query = { _id: ObjectId(id) };
                const product = await productsCollection.findOne(query);
                res.json(product);
            })
            //add product api
            app.post('/addproduct',async(req,res)=>{
                const productInfo = req.body;
                const result = await productsCollection.insertOne(productInfo);
                res.json(result)
            })
            app.delete('/products',async(req,res)=>{
                const id=req.query.id;
                const result =await productsCollection.deleteOne({_id:ObjectId(id)});
                res.json(result)
            })


//--------------------- OrderInfo--------------------
            app.get('/allorder', async(req,res)=>{
                const cursor= productsInformationCollection.find({})
                const orders=await cursor.toArray();
                res.json(orders)
            })
            app.delete('/allorder',async(req,res)=>{
                const id=req.query.id;
                const result =await productsInformationCollection.deleteOne({_id:ObjectId(id)});
                res.json(result)
            })
            app.post('/myorder', async(req,res)=>{
                const cursor= productsInformationCollection.find({email:req.query.email})
                const products=await cursor.toArray();
                res.json(products)
             })
             //update api
             app.put('/allorder', async (req, res) => {
                 let status=false;
                 if(req.query.status==="false") status=true;
                const filter = {_id:ObjectId(req.query.id)};
                const options = { upsert: true };
                const updateDoc = { $set: {
                    status: status
                } };
                const result = await productsInformationCollection.updateOne(filter, updateDoc, options);
                res.json(result);
            });
             app.post('/order',async(req,res)=>{
            const productInfo = req.body;
            const result = await productsInformationCollection.insertOne(productInfo);
            res.json(result)
            })
            
//------------------Review--------------
    //add review
    app.post('/review',async(req,res)=>{
        const result = await reviewCollection.insertOne(req.body);
        res.json(result)
    })
    //get review
    app.get('/review', async(req,res)=>{
            const cursor= reviewCollection.find({})
            const reviews=await cursor.toArray();
            res.json(reviews)
    })

//---------------user ---------------------
    app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    })

    app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result);
    });
    app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    });
    // make adimin
    app.put('/makeadmin', async (req, res) => {
        const filter = { email: req.query.email };
        const options = { upsert: true };
        const updateDoc = { $set: {
            role:"admin"
        } };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    });

    }
    finally{

    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('Clock Fox server');
});

app.listen(port,()=>{
    console.log("Server Running at ",port)
})
