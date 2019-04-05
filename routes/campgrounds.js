var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var MapboxClient = require("mapbox");

//INDEX - show all campgrounds
// the beginning of each route contains /campgrounds, we refactored this in our
// app.js statements to use our route files
router.get("/", function(req, res){
    //Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
            req.flash("error", "Oh no, something went wrong");
            res.redirect("back");
        } else {
            res.render("campgrounds/index", {campgrounds:allCampgrounds, currentUser: req.user, page: "campgrounds"});
        }
    });
    
});

//CREATE - add new campground
router.post("/", middleware.isLoggedIn, function(req, res){
    //get data from form and add to campgrounds
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name: name, image: image, description: desc, author: author, price: price};
    //create a new campground and save to database
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            req.flash("error", "Hmmm... something went wrong");
            console.log(err);
            res.redirect("back");
        } else {
            //redirect back to campgrounds
            req.flash("success", "New campground added to database");
            res.redirect("/campgrounds");
        }
    });
});

//New - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
    //find the campground with provided ID
    //populate comments array and execute our function
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Yikes! Campground not found");
            res.redirect("back");
        } else {
             //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err || !foundCampground){
            req.flash("error", "It would seem we could not find that campground");
            return res.redirect("back");
        }
        res.render("campgrounds/edit", {campground: foundCampground});
    });
    
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //find and update campground by ID
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            req.flash("error", "ZOINKS! Something went wrong. Unable to update");
            res.redirect("/campgrounds");
        } else {
            //redirect to show page
            req.flash("success", "Campground updated");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndDelete(req.params.id, function(err){
        if(err){
            req.flash("error", "Houston, we have a problem. Unable to delete");
            res.redirect("/campgrounds");
        } else{
            req.flash("success", "Campground deleted");
            res.redirect("/campgrounds");
        }
    });
});


module.exports = router;