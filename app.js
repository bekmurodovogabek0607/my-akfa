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
const mehnat = require("./model/mehnat");

const myclient = require("./model/myclient");



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

// Verifi amal qilish muddati
function Muddat(tel) {
  verify.findOneAndDelete({ tel: tel })
    .then(resp => {
      console.log(resp);

    })
    .catch(err => {
      console.log(er);
    })

}

//send message

function sendSMS(mobile, text, res) {
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

      SendSMS(JSON.stringify('Bearer ' + response.data.data.token))


    })
    .catch(function (error) {
      console.log(error);
    });




  function SendSMS(token) {
    console.log('sms ga kirdi');

    var data = new FormData();
    console.log(mobile);
    console.log(text);

    data.append('mobile_phone', mobile);
    data.append('message', text);

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

        res.send('Jonatildi')
      })
      .catch(function (error) {

        console.log('xato 2');
      })
  }




}
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

    const ChechVerify = await verify.findOne({ tel: tel.slice(1, 13) })


    if (ChechVerify?.verify_code != verif) {
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
      registerDate: `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, tel },
      'token',
      {
        expiresIn: "2h",
      }
    );
    await verify.findByIdAndDelete(ChechVerify._id)
      .then(resp => {
        console.log(resp);
      })
      .catch(err => {
        console.log(er);
      })




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
app.post('/send', async (req, res) => {
  console.log(req.body.mobile);
  const user = await User.findOne({ tel: `+${req.body.mobile}` })
  if (user == null) {

    const verifiCode = Math.floor(Math.random() * 1000000)

    sendSMS(req.body.mobile, `Tastiqlash kodi:${verifiCode}`, res)
    const Verify_code = new verify({ tel: req.body.mobile, verify_code: verifiCode })

    Verify_code.save()
      .then(resp => {
        console.log(resp);
        res.send('Jonatildi')
        setTimeout(() => {
          Muddat(req.body.mobile)
        }, 300000);

      })
      .catch(err => {
        console.log('xato 1');
      })





  }
  else {
    res.send('userBor')
  }
})

//qarzdorga sms jonatish
app.post('/qarzdorgasms', async (req, res) => {
  sendSMS(req.body.mobile, "Hurmatli mijoz iltomos akfa eshk-derazadan qarzingizni to'lang", res)

})



// Login
app.post("/login", async (req, res) => {

  // Our login logic starts here
  try {
    // Get user input
    const { tel, password } = req.body;

    // Validate user input
    if (!(tel && password)) {
      return res.status(400).send("All input is required");
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
      return res.status(200).json(user)
    }
    res.send("Invalid");
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});
// Forget PAssword

app.post('/forget', async (req, res) => {
  console.log(req.body);
  const oldUser = await User.findOne({ tel: req.body.mobile });

  if (!oldUser) {
    return res.send("Please Login").status(409);
  }
  const sms = Math.floor(Math.random() * 100000);

  const Verify_code = new verify({ tel: req.body.mobile, verify_code: sms })
  Verify_code.save()
    .then(resp => {
      console.log(resp);
      setTimeout(() => {
        Muddat(req.body.mobile.slice(1, 13))
      }, 300000);
      res.send('Jonatildi')
      console.log('jonatildi');
    })
    .catch(err => {
      console.log('xato 1');
    })
  sendSMS(req.body.mobile.slice(1, 13), `verify code:${sms}`, res)

})
// Change Password
app.post('/checkverif', async (req, res) => {
  const { tel, verif } = req.body
  console.log(req.body);
  const ChechVerify = await verify.findOne({ tel: req.body.tel })
  console.log("ChechVerify:");
  console.log(ChechVerify);
  if (ChechVerify?.verify_code != verif) {
    res.send("Invalit Password").status(409);
  }
  else {
    await verify.findOneAndDelete({ tel: req.body.tel })
      .then(resp => {
        console.log(resp);
        res.send('ok')
      })
      .catch(err => {
        console.log(er);
      })
  }



})
// chenge password
app.post('/changepassword', async (req, res) => {
  console.log(req.body);
  encryptedPassword = await bcrypt.hash(req.body.password, 10);
  await User.findOneAndUpdate({ tel: req.body.tel }, { password: encryptedPassword })
    .then(resp => {
      res.send('updated')
    })
    .catch(err => {
      console.log(err);
    })

})
// 

app.post('myzakaz', async (req, res) => {


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
app.get('/myzakaz/:id', async (req, res) => {
  myzakaz.find({ userId: req.params.id })
    .then(resp => {
      res.send(resp[0].product)
    })
    .catch(err => {
      console.log(err);
    })
})

app.post('/myproduct', async (req, res) => {
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
app.get('/myproduct/:id', async (req, res) => {
  product.find({ userId: req.params.id })
    .then(resp => {
      if (resp.length == 0) { res.send('no date') }
      else { res.send(resp[0].product) }

    })
    .catch(err => {
      console.log(err);
    })
})

app.get("/welcome", async (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});
// mehnat haqqi sifatida
app.post('/mystyles', async (req, res) => {
  const { userId, total } = req.body
  console.log('userIDmi:' + userId);
  console.log('total:');
  console.log(total);

  const Oldmehnat = await mehnat.findOne({ userId })

  console.log(Oldmehnat);
  if (!Oldmehnat) {
    const newMehnat = new mehnat({ userId: userId, total: total })
    newMehnat.save()
      .then(resp => {
        res.send('Saved')
      })
      .catch(err => {
        console.log(err);
      })
  }
  else {
    const chechUpdtae = Oldmehnat.total.filter(item => item.style == total[0].style)
    const Updtae = Oldmehnat.total.filter(item => item.style != total[0].style)
    console.log('yangi kelgani');
    console.log(chechUpdtae);
    console.log('qolganlari');
    console.log(Updtae);
    if (chechUpdtae.length == 0) {
      await mehnat.findOneAndUpdate({ userId }, { total: [...Oldmehnat.total, ...total] })
        .then(resp => {
          res.send('Updated')
        })
        .catch(err => {
          console.log(err);
        })
    }
    else {
      await mehnat.findOneAndUpdate({ userId }, { total: [...Updtae, ...total] })
        .then(resp => {
          res.send('Updated')
        })
        .catch(err => {
          console.log(err);
        })
    }



  }

})
// delete mehnat haqqi sifatida
app.post('/mystylesdelete', async (req, res) => {
  const { userId, style } = req.body
  const Oldmehnat = await mehnat.findOne({ userId })
  console.log(Oldmehnat);
  const newTotal = Oldmehnat.total.filter(item => item.style != style)
  await mehnat.findOneAndUpdate({ userId }, { total: newTotal })
    .then(reps => {
      res.send('Deleted')
    })
    .catch(err => {
      console.log(err);
    })
})
//get mehnat 
app.get('/mystyles/:id', async (req, res) => {
  await mehnat.findOne({ userId: req.params.id })
    .then(resp => {

      res.send(resp)

    })
    .catch(err => {
      console.log(err);
    })
})
// my-client create
app.post('/myclient', async (req, res) => {
  const sss = req.body.zakaz
  console.log(sss);
  const sum = sss.reduce((a, b) => {
    if (b.narxi != undefined) return a + (b.narxi * b.soni)
    else return a

  }, 0);
  const myclientt = new myclient({ ...req.body, status: 0, umumiysumma: sum, buyurtmaraqami: Math.floor(Math.random() * 10000000000), qabuldata: `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}` })
  myclientt.save()
    .then(resp => {
      res.send("Jonatildi")
      // sendSMS(req.body.tel.slice(1,13),'Buyutmangiz qabul qilindi',res)
    })
    .catch(err => {
      console.log(err);
    })

})
app.get('/allmyclient/:id', async (req, res) => {
  await myclient.find({ userId: req.params.id })
    .then(resp => {
      res.send(resp)
    })
    .catch(err => {
      console.log(err);
    })
})
app.post('/clientok/:id', async (req, res) => {
  await myclient.findOneAndUpdate({ _id: req.params.id }, { status: req.body.status })
    .then(resp => {
      res.send('updated')
    })
    .catch(err => {
      console.log(err);
    })
})
app.post('/clientdelete/:id', async (req, res) => {
  await myclient.findByIdAndDelete(req.params.id)
    .then(resp => {
      res.send('updated')
    })
    .catch(err => {
      console.log(err);
    })
})
app.post('/clientqarz/:id', async (req, res) => {
  await myclient.findOneAndUpdate({ _id: req.params.id }, { status: req.body.status, tolangansumma: req.body.tolangansumma })
    .then(resp => {
      res.send('updated')
    })
    .catch(err => {
      console.log(err);
    })
})

module.exports = app;