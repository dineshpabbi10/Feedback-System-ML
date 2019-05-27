var mongoose =  require("mongoose");

commentSchema = mongoose.Schema({
    author: String,
    content: String,
});

module.exports = mongoose.model("comment",commentSchema);