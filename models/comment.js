var mongoose = require("mongoose");

//create our schema
var commentSchema = mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
}); 

//create our model and export
module.exports = mongoose.model("Comment", commentSchema);