var mongoose = require("mongoose");

//SCHEMA SETUP -> will be broken into smaller schemas later
var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment"
        }
    ]
});

//model and export
module.exports = mongoose.model("Campground", campgroundSchema);