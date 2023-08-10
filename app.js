require("dotenv").config();
var axios = require('axios');
var FormData = require('form-data');
require("./config/database").connect();
const auth = require("./middleware/auth");
const express = require("express");
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const cors = require('cors')

const app = express();
app.use(cors())
app.use(express.json());
app.use(bodyParser.json())

const User = require("./model/user");

const myzakaz = require("./model/myzakaz");
const product = require("./model/product");


//get token
app.get('/token', (req, res) => {
  var config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'notify.eskiz.uz/api/auth/user',
    headers: {}
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
})

//send message

app.post('/send', (req, res) => {


  var data = new FormData();
  data.append('email', 'bekmurodovogabek0607@gmail.com');
  data.append('password', 'VzWIyT6QfctO5D8thYkXtpOsk1sp4ACJa52ue8xH');

  var config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'notify.eskiz.uz/api/auth/login',
    headers: {
      ...data.getHeaders()
    },
    data: data
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
  // var data = '{\r\n    "messages": [\r\n        {"user_sms_id":"sms1","to": 998993857759, "text": "eto test"},\r\n  ],\r\n    "from": "4546",\r\n    "dispatch_id": 123\r\n}';

  // var config = {
  //   method: 'post',
  //   maxBodyLength: Infinity,
  //   url: 'notify.eskiz.uz/api/message/sms/send-batch',
  //   headers: {
  //     'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjQ3MDEsInJvbGUiOm51bGwsImRhdGEiOnsiaWQiOjQ3MDEsIm5hbWUiOiJTYXlpZG92YSBEaWxkb3JhIFRvaXJvdm5hIiwiZW1haWwiOiJiZWttdXJvZG92b2dhYmVrMDYwN0BnbWFpbC5jb20iLCJyb2xlIjpudWxsLCJhcGlfdG9rZW4iOm51bGwsInN0YXR1cyI6ImFjdGl2ZSIsInNtc19hcGlfbG9naW4iOiJlc2tpejIiLCJzbXNfYXBpX3Bhc3N3b3JkIjoiZSQkayF6IiwidXpfcHJpY2UiOjUwLCJ1Y2VsbF9wcmljZSI6MTE1LCJ0ZXN0X3VjZWxsX3ByaWNlIjpudWxsLCJiYWxhbmNlIjo0OTUwLCJpc192aXAiOjAsImhvc3QiOiJzZXJ2ZXIxIiwiY3JlYXRlZF9hdCI6IjIwMjMtMDgtMDlUMTE6MDg6MzEuMDAwMDAwWiIsInVwZGF0ZWRfYXQiOiIyMDIzLTA4LTEwVDA5OjUxOjAzLjAwMDAwMFoiLCJ3aGl0ZWxpc3QiOm51bGwsImhhc19wZXJmZWN0dW0iOjAsImJlZWxpbmVfcHJpY2UiOm51bGx9LCJpYXQiOjE2OTE2NjQyNDYsImV4cCI6MTY5NDI1NjI0Nn0.GPWeBcnlP-8ZzCuXwvKunERVIEL4Ihpt3qktlyDWgTg'
  //   },
  //   data: data
  // };

  // axios(config)
  //   .then(function (response) {
  //     console.log(JSON.stringify(response.data));
  //   })
  //   .catch(function (error) {
  //     console.log(error);
  //   });
})
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
      faol: `${new Date().getDay()}-${new Date().getMonth() + 2}-${new Date().getFullYear()}`,
      registerDate: `${new Date().getDay()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`,
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

app.post('myzakaz', auth, async (req, res) => {


  myzakaz.find({ userId: req.body.userId })
    .then(resp => {
      if (resp.length == 0) {
        const zakaz = new myzakaz(req.body)
        zakaz.save()
        res.send('Saved')
      }
      else {
        myzakaz.findByIdAndUpdate(resp[0].id, req.body)
          .then(rerpons => {
            res.send("updated")
          })
          .catch(err => {
            res.send(err)

          })

      }
    })
    .catch(err => {
      res.send('Error')
    })
})
app.get('/myzakaz/:id', auth, async (req, res) => {
  myzakaz.find({ userId: req.params.id })
    .then(resp => {
      res.send(resp[0].product)
    })
    .catch(err => {
      console.log(err);
    })
})

app.post('/myproduct', auth, async (req, res) => {
  console.log(req.body);
  product.find({ userId: req.body.userId })
    .then(resp => {
      if (resp.length == 0) {
        const Product = new product(req.body)
        Product.save()
        res.send('Saved')
      }
      else {
        product.findByIdAndUpdate(resp[0].id, req.body)
          .then(rerpons => {
            res.send("updated")
          })
          .catch(err => {
            res.send(err)

          })

      }
    })
    .catch(err => {
      res.send('Error')
    })


})
app.get('/myproduct/:id', auth, async (req, res) => {
  product.find({ userId: req.params.id })
    .then(resp => {
      if (resp.length == 0) { res.send('no date') }
      else { res.send(resp[0].product) }

    })
    .catch(err => {
      console.log(err);
    })
})

app.get("/welcome", auth, async (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

module.exports = app;