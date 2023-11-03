const mongoose = require("mongoose");

const verify = new mongoose.Schema({
   
    tel: { type: String },
    verifycode:{type:String},
   
    gacha:{type:String},

});

module.exports = mongoose.model("verify", verify);