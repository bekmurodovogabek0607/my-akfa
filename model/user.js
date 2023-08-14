const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, default: null },
   
   
    tel: { type: String },

    password: { type: String },
    registerDate:{type:String},
    faol:{type:String},
  
    token: { type: String },
});

module.exports = mongoose.model("user", userSchema);