var mongoose = require("mongoose");

var campSchema  = new mongoose.Schema({
    name: String,
    url: String,
    description: String,
    comments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "comment"
    }]
})

module.exports = mongoose.model("camp",campSchema);