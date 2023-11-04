const mongoose = require("mongoose");

const verify = new mongoose.Schema({
   
    tel: { type: String },
    verifycode:{type:String},
    gacha:{type:Number},

});

module.exports = mongoose.model("verify", verify);