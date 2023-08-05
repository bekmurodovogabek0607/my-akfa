const mongoose = require("mongoose");

const zakazSchema = new mongoose.Schema({
    name: String,
    tel: String,
    adress: String,
    userid:String,
    zakaz: [
        {
            ZakazStyles: String,
            soni: Number,
            id: String,
            boyi: Number,
            eni: Number,
            narxi: Number,
            akraasos: Number,
            arkaBalandligi: Number,
            tepaOynaBalnad:Number,
            pallaEni:Number,
            DerazaPalla: Number,
            ProfilKompani: String,
            oyna: String,
            oynaQavat: String,
            MaxanizmDeraza: String,
            tor: String,
            oshiqmoshiq: String,
            userId: String,
            eshikZamog: String,
            derazaTutuqich: String,
            EshikPastkiQism: String,
            ProfilColor: String,
        }
    ]


});

module.exports = mongoose.model("myzakaz", zakazSchema);