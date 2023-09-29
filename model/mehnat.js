const mongoose = require("mongoose");

const mehnatSchema = new mongoose.Schema({
    userId: { type: String },
    total:[{
        style:String,
        foiz:Number,
        price:Number,
        petle:Number,
        tich:Number,
        chovuch:Number,
        saydinitil:Number
    }]
});

module.exports = mongoose.model("mehnat", mehnatSchema);