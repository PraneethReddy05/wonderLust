const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");//requiring listing model
const Review = require("../models/review.js");//requiring review model
const wrapAsync = require("../utils/wrspAsync.js");
const {isLoggedIn, validatingReview, isReviewAuthor} = require("../middleware.js");

//Reviews
//Adding new review
router.post("/", isLoggedIn, validatingReview, wrapAsync(async(req,res)=>{
    // console.log(req.body.review);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    // console.log(listing);
    req.flash("success","New review created!");
    res.redirect(`/listings/${listing._id}`);
    // console.log(newReview);
}));

//deleting a review
router.delete("/:reviewId", isReviewAuthor, wrapAsync(async(req,res)=>{
    let { id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review successfully deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;