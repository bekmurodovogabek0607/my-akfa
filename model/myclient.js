const mongoose = require("mongoose");
// holat     0 bolsa buyurtma qabul qilindi    1   bo'lsa   buyurtma najarib topshirildi qarzdorlik yoq  2 bo'lsa qarzdorlik mavjud

const userclient = new mongoose.Schema({
    name: { type: String },
    tel: { type: String },
    manzil: { type: String },
    userId:String,
    status: Number,
    tolangansumma: Number,
    umumiysumma: Number,
    buyurtmaraqami:Number,
    qabuldata:String,
    topshirildidata:String,
    zakaz: [
        {
            stylename: String,
            profil: String,
            shisha: String,
            shishaqavat: String,
            mexanizm: String,
            tor: String,
            zamok: String,
            oshiqmoshiq: String,
            soni: Number,
            narxi: Number,
            eni:Number,
            boyi:Number,
            arkaasos:Number,
            arkabalandligi:Number,
            rangi:String

        }
    ]

});

module.exports = mongoose.model("myclient", userclient);