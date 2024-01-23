const mongoose = require("mongoose");

const tolov = new mongoose.Schema({
    userId: { type: String },
    imagePath: { type: String },
    dateSend: { type: String },
    datePay:{type:String},
    payment:{type:Boolean},
    tel:{type:String},
    summa:{type:Number}
   
});

module.exports = mongoose.model("tolov", tolov);