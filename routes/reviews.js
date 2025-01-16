const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");//requiring listing model
const Review = require("../models/review.js");//requiring review model
const wrapAsync = require("../utils/wrspAsync.js");
const ExpressError = require("../utils/ExpressErrors.js");
const {reviewSchema}= require("../schema.js");//requiting joy schema for server side validation of Listings and reviews


//function(middleware) for clientside validation of reviews
const validatingReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let msgErr = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};


//Reviews
//Adding new review
router.post("/", validatingReview, wrapAsync(async(req,res)=>{
    // console.log(req.body.review);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    // console.log(listing);
    res.redirect(`/listings/${listing._id}`);
    // console.log(newReview);
}));

//deleting a review
router.delete("/:reviewId", wrapAsync(async(req,res)=>{
    let { id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

module.exports = router;