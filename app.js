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
const fileUpload = require('express-fileupload');
const cors = require('cors')
const path = require('path')
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
const { UploadFileFunc } = require("./controller/fileUpload");
const { DownloadFile } = require("./controller/fileDownload");
const tolov = require("./model/tolov");
app.use(fileUpload({
  createParentPath: true,

}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.post('/fileuploadtest', UploadFileFunc)
app.get('/download', DownloadFile)
const SMSnarxi = 70

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
  setTimeout(verify.findOneAndDelete({ tel: tel })
    .then(resp => {
      console.log(resp);

    })
    .catch(err => {
      console.log(er);
    }), 300000);


}
setInterval(() => {
  verify.find()
    .then(resp => {

      for (let i = 0; i < resp.length; i++) {
        if (resp[i].gacha < new Date().getTime()) {
          verify.findByIdAndDelete(resp[i]._id)
            .then(rees => {
              console.log('deleted');
            })
            .catch(err => {
              console.log('verifyni avtoochirishda xatolik');
            })
        }

      }

    })
    .catch(err => {
      console.log(err);
    })

}, 30000);

function AvtoFaol() {
  User.find()
    .then(resp => {
      for (let i = 0; i < resp.length; i++) {
        const date = new Date().getDate()
        const mons = new Date().getMonth() + 1
        const year = new Date().getFullYear()
        const faoll = resp[i].faol.split('-')
        const faol = Number(faoll[2]) * 365 + Number(faoll[1]) * 30 + Number(faoll[0])
        const Hozir = year * 365 + mons * 30 + date
        console.log(resp[i].name);

        console.log(faol);
        console.log(Hozir);

        if (resp[i].shot >= resp[i].tarif && faol <= Hozir) {
          const tarifoyi = resp[i].tarif / 25000
          const oyi = new Date().getMonth() + 1 + tarifoyi
          let oniqoyi = 1
          let yili = 0
          if (oyi > 12) {
            oniqoyi = oyi - 12
            yili = 1
          }
          else {
            oniqoyi = oyi
            yili = 0
          }
          User.findOneAndUpdate({ tel: resp[i].tel },
            {
              shot: resp[i].shot - resp[i].tarif,
              faol: `${new Date().getDate()}-${oniqoyi}-${new Date().getFullYear() + yili}`,
              sms: 50
            })
            .then(res => {
              console.log('okey');
            })
            .catch(err => {
              console.log('xatolik');
            })
        }

      }
    })
    .catch(err => {
      console.log(err);
    })


}
//send messageexpress-fileupload
setInterval(AvtoFaol, 86400000);
//86400000
function sendSMS(mobile, text, res) {
  //bekmurodovogabek0607@gmail.com
  //VzWIyT6QfctO5D8thYkXtpOsk1sp4ACJa52ue8xH
  var data = new FormData();
  data.append('email', 'bekmurodovogabek919@gmail.com');
  data.append('password', 'nsshRXnEc0xQZ98uKn1JToEYkYK3MauawdsWkAy3');

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

      SendSM(`Bearer ${response.data.data.token}`)


    })
    .catch(function (error) {
      console.log(error);
    });




  function SendSM(token) {
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

    axios(config).then(function (response) {
      res.send('Jonatildi')
    })
      .catch(function (error) {
        console.log('sms ketmadi');
        console.log(error);
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


    if (ChechVerify?.verifycode != verif) {
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
      shot: 25000,
      sms: 50,
      tarif: 25000
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
  console.log('user:' + user);
  if (user == null) {

    const verifiCode = Math.floor(Math.random() * 1000000)
    const Verify = new verify({ tel: req.body.mobile, verifycode: verifiCode, gacha: (new Date().getTime() + 300000) })
    Verify.save()
      .then(resp => {
        console.log('saqlandi');

        // sendSMS(req.body.mobile, `Tastiqlash kodi:${verifiCode}`, res)
        res.send('Jonatildi')
      })
      .catch(err => {
        console.log('Verifyda xatolik');
        console.log(err);

      })
  }
  else {
    res.send('userBor')
  }
})

//qarzdorga sms jonatish
app.post('/qarzdorgasms', async (req, res) => {
  User.findById(req.body.userid)
    .then(resp => {
      if (resp.sms > 0) {
        User.findByIdAndUpdate(req.body.userid, { sms: (resp.sms - 1) })
          .then(rrr => {

            sendSMS(req.body.mobile, "Hurmatli mijoz iltomos akfa eshik-derazadan qolgan qarzingizni to'lang", res)

          })

      }
      else if (resp.shot > SMSnarxi) {
        User.findByIdAndUpdate(req.body.userid, { shot: (resp.shot - SMSnarxi) })
          .then(rrr => {

            sendSMS(req.body.mobile, "Hurmatli mijoz iltomos akfa eshik-derazadan qolgan qarzingizni to'lang", res)

          })
      }
      else {
        res.send("mablag")
      }
    })
    .catch(err => {
      console.log(err);
    })

})

// Login
app.post("/login", async (req, res) => {

  if (req.body.password == 'dashbortits' && req.body.tel == "+998993857759") {
    res.send('dashbort')
  }
  else {
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
  }


});
// Forget PAssword

app.post('/forget', async (req, res) => {
  console.log(req.body);
  const oldUser = await User.findOne({ tel: req.body.mobile });

  if (!oldUser) {
    return res.send("Please Login").status(409);
  }
  const sms = Math.floor(Math.random() * 100000);

  const Verify_code = new verify({ tel: req.body.mobile, verifycode: sms, gacha: (new Date().getTime() + 300000) })
  Verify_code.save()
    .then(resp => {
      console.log(resp);

      sendSMS(req.body.mobile.slice(1, 13), `verify code:${sms}`, res)
    })
    .catch(err => {
      console.log('xato 1');
    })


})
// Change Password
app.post('/checkverif', async (req, res) => {
  const { tel, verif } = req.body
  console.log(req.body);
  const ChechVerify = await verify.findOne({ tel: req.body.tel })
  console.log("ChechVerify:");
  console.log(ChechVerify);
  if (ChechVerify?.verifycode != verif) {
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
app.post('/changetarif', async (req, res) => {
  User.findOneAndUpdate({ _id: req.body.id }, { tarif: req.body.tarif })
    .then(resp => {
      res.send('ok')
    })
    .catch(err => {
      res.send('xatolik')
    })
})
// doashtbot uchun

app.get('/allusers', async (req, res) => {
  await User.find()
    .then(resp => {

      res.send(resp)

    })
    .catch(err => {
      res.send('xatolik')
    })
})
app.post('/updateuser', async (req, res) => {
  console.log(req.body);
  await User.findByIdAndUpdate(req.body.id, { faol: req.body.faol, shot: req.body.shot, tel: req.body.tel, tarif: req.body.tarif })
    .then(resp => {
      AvtoFaol()
      res.send('updated')
    })
    .catch(err => {
      console.log(err);
    })

})
app.post('/sendchek', async (req, res) => {
  const date = new Date().getDate()
  const mons = new Date().getMonth() + 1
  const year = new Date().getFullYear()
  const hour = new Date().getHours()
  const min = new Date().getMinutes()
  const sek = new Date().getSeconds()

  if (req.body.imagePath == undefined) {
    res.send('no imgPath')
  }
  else {
    const chek = new tolov({
      userId: req.body.userId,
      imagePath: req.body.imagePath,
      dateSend: `${date}-${mons}-${year} ${hour}:${min}:${sek}`,
      payment: false,
      tel: req.body.tel,

    })
    chek.save()
      .then(respp => {
        res.send('yuborildi')
      })
      .catch(err => {
        res.send('xatolik')
      })
  }


})
app.get('/sendchek', (req, res) => {
  tolov.find()
    .then(resp => {
      res.send(resp)
    })
    .catch(err => {
      res.send('xatolik')
    })
})
app.post('/payment', async (req, res) => {
  const date = new Date().getDate()
  const mons = new Date().getMonth() + 1
  const year = new Date().getFullYear()
  const hour = new Date().getHours()
  const min = new Date().getMinutes()
  const sek = new Date().getSeconds()
  await tolov.findByIdAndUpdate(req.body.ckeckId, { payment: true, datePay: `${date}-${mons}-${year} ${hour}:${min}:${sek}`, summa: req.body.PaymentPrice })
    .then(resp => {
      User.findById(req.body.userId)
        .then(resp => {
          console.log(resp);
          User.findByIdAndUpdate(resp._id,{shot:resp.shot+req.body.PaymentPrice})
          .then(()=>{
            res.send('ok')
            AvtoFaol()
          })
          .catch(err=>{
            console.log(err);
          })
        })
        .catch(err => {
          console.log(err);
        })
    })
    .catch(err => {
      res.send('xato')
    })

})
module.exports = app;










