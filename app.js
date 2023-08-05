require("dotenv").config();
require("./config/database").connect();
const auth = require("./middleware/auth");
const express = require("express");
const bodyParser=require('body-parser')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const cors=require('cors')

const app = express();
app.use(cors())
app.use(express.json());
app.use(bodyParser.json())

const User = require("./model/user");

const myzakaz = require("./model/myzakaz");
const product = require("./model/product");

// Register
app.post("/register", async (req, res) => {

    // Our register logic starts here
    try {
      // Get user input
      const { name, email, password } = req.body;
  
      // Validate user input
      if (!(email && password && name)) {
        res.status(400).send("All input is required");
      }
  
      // check if user already exist
      // Validate if user exist in our database
      const oldUser = await User.findOne({ email });
  
      if (oldUser) {
        return res.send("Please Login").status(409);
      }
  
      //Encrypt user password
      encryptedPassword = await bcrypt.hash(password, 10);
  
      // Create user in our database
      const user = await User.create({
        name,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        password: encryptedPassword,
        faol:`${new Date().getDay()}-${new Date().getMonth()+2}-${new Date().getFullYear()}`,
        registerDate:`${new Date().getDay()}-${new Date().getMonth()+1}-${new Date().getFullYear()}`,
      });
  
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      user.token = token;
  
      // return new user
      res.status(201).json(user);
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });



// Login
app.post("/login", async (req, res) => {

    // Our login logic starts here
    try {
      // Get user input
      const { email, password } = req.body;
  
      // Validate user input
      if (!(email && password)) {
        res.status(400).send("All input is required");
      }
      // Validate if user exist in our database
      const user = await User.findOne({ email });
  
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
  
        // save user token
        user.token = token;
  
        // user
        res.status(200).json(user);
      }
      res.send("Invalid");
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });
  
app.post('myzakaz',(req,res)=>{
  
  
  myzakaz.find({userId:req.body.userId})
  .then(resp=>{
    if(resp.length==0){
      const zakaz=new myzakaz(req.body)
      zakaz.save()
      res.send('Saved')
    }
    else{
      myzakaz.findByIdAndUpdate(resp[0].id,req.body)
      .then(rerpons=>{
        res.send("updated")
      })
      .catch(err=>{
        res.send(err)

      })
      
    }
  })
  .catch(err=>{
      res.send('Error')
    })
})

app.post('/myproduct',(req,res)=>{
  console.log(req.body);
  product.find({userId:req.body.userId})
  .then(resp=>{
    if(resp.length==0){
      const Product=new product(req.body)
      Product.save()
      res.send('Saved')
    }
    else{
      product.findByIdAndUpdate(resp[0].id,req.body)
      .then(rerpons=>{
        res.send("updated")
      })
      .catch(err=>{
        res.send(err)

      })
      
    }
  })
  .catch(err=>{
      res.send('Error')
    })

 
})
app.get('/myproduct/:id',(req,res)=>{
  product.find({userId:req.params.id})
  .then(resp=>{
    res.send(resp[0].product)
  })
  .catch(err=>{
    console.log(err);
  })
})

app.get("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});

module.exports = app;