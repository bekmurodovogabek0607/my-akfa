const mongoose = require("mongoose");

const verify = new mongoose.Schema({
   
    tel: { type: String },
    verify_code:{type:String},
   
});

module.exports = mongoose.model("verify", verify);