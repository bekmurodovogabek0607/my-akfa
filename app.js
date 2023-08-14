require("dotenv").config();
var axios = require('axios');
var FormData = require('form-data');
var request = require('request');
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
const verify = require("./model/verifyuser");



//get token
// app.get('/token', (req, res) => {
//   var data = new FormData();
//   data.append('email', 'bekmurodovogabek0607@gmail.com');
//   data.append('password', 'VzWIyT6QfctO5D8thYkXtpOsk1sp4ACJa52ue8xH');

//   var config = {
//     method: 'post',
//     maxBodyLength: Infinity,
//     url: 'https://notify.eskiz.uz/api/auth/login',

//     headers: {
//       ...data.getHeaders()
//     },
//     data: data
//   };

//   axios(config)
//     .then(function (response) {
//       console.log(JSON.stringify(response.data));
//     })
//     .catch(function (error) {
//       res.send(error)
//     });

// })

//send message

app.post('/send', async (req, res) => {

  const oldUser = await User.findOne({ tel: req.body.mobile });

  if (oldUser) {
    return res.send("Please Login").status(409);
  }
  var data = new FormData();
  data.append('email', 'bekmurodovogabek0607@gmail.com');
  data.append('password', 'VzWIyT6QfctO5D8thYkXtpOsk1sp4ACJa52ue8xH');

  var config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://notify.eskiz.uz/api/auth/login',

    headers: {
      ...data.getHeaders()
    },
    data: data
  };

  axios(config)
    .then(async function (response) {
      console.log(req.body.mobile);
      const user = await User.findOne({ tel: `+${req.body.mobile}` });
      console.log(user);
      if (user != null) { res.send('userBor') }
      else {
        SendSMS(JSON.stringify('Bearer ' + response.data.data.token))

      }
    })
    .catch(function (error) {
      res.send(error)
    });




  function SendSMS(token) {
    console.log('sms ga kirdi');
    console.log(req.body);
    var data = new FormData();
    const sms = Math.floor(Math.random() * 100000);
    data.append('mobile_phone', req.body.mobile);
    data.append('message', `verify code-${sms}`);
    data.append('from', '4546');
    data.append('callback_url', 'http://0000.uz/test.php');
    var config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://notify.eskiz.uz/api/message/sms/send',
      headers: {
        'Authorization': token,
        ...data.getHeaders()
      },
      data: data
    };
    console.log('sms ga kirdi shu yergacha ishladi');

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        const Verify_code = new verify({ tel: req.body.mobile, verify_code: sms })
        Verify_code.save()
          .then(resp => {
            console.log(resp);
            res.send('Jonatildi')
            console.log('jonatildi');
          })
          .catch(err => {
            console.log('xato 1');
          })




      })
      .catch(function (error) {
        console.log(error);
        console.log('xato 2');
      })
  }




})
// Register

app.post("/register", async (req, res) => {
  console.log(req.body);
  // Our register logic starts here
  try {
    // Get user input
    const { name, tel, password, verif } = req.body;

    // Validate user input
    if (!(tel && password && name && verif)) {
      return res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database

    const ChechToken = await verify.findOne({ tel: tel.slice(1, 13)})
    console.log('tekshirish veryfy:'+ChechToken);
    console.log('tekshirish veryfy body:'+verif);

    if (ChechToken?.verify_code != verif) {
      return res.send("Invalit Password").status(409);
    }
    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      name,
      tel, // sanitize: convert email to lowercase

      password: encryptedPassword,
      verif,
      faol: `${new Date().getDate()}-${new Date().getMonth() + 2}-${new Date().getFullYear()}`,
      registerDate: `${new Date().getDay()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, tel },
      'token',
      {
        expiresIn: "2h",
      }
    );



    // save user token
    user.token = token;
    // return new user
    res.status(201).json(user);




  } catch (err) {
    console.log('xato bu yerdan');
    console.log(err);
  }
  // Our register logic ends here
});



// Login
app.post("/login", async (req, res) => {

  // Our login logic starts here
  try {
    // Get user input
    const { tel, password } = req.body;

    // Validate user input
    if (!(tel && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ tel });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, tel },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json(user)
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