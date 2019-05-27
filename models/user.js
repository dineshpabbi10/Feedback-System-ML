var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = mongoose.Schema({
    username:String,
    password:String,
    permission:{
        type:String,
        default:"user",
    },
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("user",userSchema);