var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// comments NEW - display form to add a new comment on particular campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
    //find campground by ID
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            //render our new comment page and send campground through to the template
            res.render("comments/new", {campground: campground});
        }
    });
});

// comments CREATE - add new comment to particular campground in DB
router.post("/", middleware.isLoggedIn, function(req, res){
    //lookup campground by ID
    Campground.findById(req.params.id, function(err, campground) {
       if(err){
           res.redirect("/campgrounds");
       } else  {
           //create a new comment
           Comment.create(req.body.comment, function(err, comment){
               if(err){
                   req.flash("error", "It seems as though something has gone wrong");
                   res.redirect("back");
               } else{
                   //add username and id to comment
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   //save comment
                   comment.save();
                   //associate new comment to campground, save, then redirect back to campground showpage
                   campground.comments.push(comment);
                   campground.save();
                   req.flash("success", "Successfully added comment");
                   res.redirect("/campgrounds/" + campground._id);
               }
           });
       }
    });
});

//EDIT COMMENTS ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership,function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err || !foundCampground) {
            req.flash("error", "Campground could not be found");
            return res.redirect("back");
        } 
        //get comment info to send to edit template
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err){
                req.flash("error", "Crikey! Something has gone wrong");
                res.redirect("back");
            } else {
                //show edit comment template
                //get campground ID and pass to our edit template
                res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
            }
        });
    });
});

//UPDATE COMMENTS ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            req.flash("error", "Unable to update comment");
            res.redirect("back");
        } else {
            req.flash("success", "Your comment has been updated");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//DESTROY COMMENT ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   //find by id and remove
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           req.flash("error", "Something seems to have gone wrong");
           res.redirect("back");
       } else {
           req.flash("success", "Comment deleted");
           res.redirect("/campgrounds/" + req.params.id);
       }
   });
});



module.exports = router;