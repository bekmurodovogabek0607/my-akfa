const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, default: null },
    tel: { type: String },
    password: { type: String },
    registerDate:{type:String},
    faol:{type:String},
    token: { type: String },
    shot:{type:Number},
    sms:{type:Number},
    tarif:{type:Number}
});

module.exports = mongoose.model("user", userSchema);