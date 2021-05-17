const mongoose = require("mongoose");
const { Schema }  = mongoose;

const foodSchema = new Schema({
    prodNum: {
        type: String,
        defualt: "-1",
        required: true,
        unique: true
    },
    prodName: {
        type: String,
        required: true,
    },
    materials: [{
        type: String
    }]
});

module.exports = mongoose.model("Food", foodSchema);