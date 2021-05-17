const mongoose = require("mongoose");
const { Schema } = mongoose;

const materialSchema = new Schema({
    matName: {
        type: String,
        required: true
    },
    type: {
        type:String,
        required: true
    }
})

module.exports = mongoose.model("Material", materialSchema);