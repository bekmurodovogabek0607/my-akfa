const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    userId:String,
    product:{
        mexanizm: [{ mexanizm: String, narxi: Number }],
        pastki: [{ profil: String, narxi: Number }],
        shisha:[ { shisha: String, narxi: Number }],
       
        chovuch:[ { chovuch: String, narxi: Number }],
        rezinashisha:[ { rezinashisha: String, narxi: Number }],
        rezinaprofil:[ { rezinaprofil: String, narxi: Number }],
        saydinitil:[ { saydinitil: String, narxi: Number }],
        tor: [{ tor: String, narxi: Number }],
        profil: [{ profil: String, kosa: Number, orta: Number, shitapik: Number ,qanot:Number,tich:Number,petle:Number}],
        zamok: [{ zamok: String, shisha: Number }]
    }
});

module.exports = mongoose.model("product", productSchema);