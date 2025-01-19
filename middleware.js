const Listing = require("./models/listing");
const Review = require("./models/review.js");//requiring review model
const ExpressError = require("./utils/ExpressErrors.js");
const {listingSchema, reviewSchema}= require("./schema.js");//requiting joy schema for server side validation of Listings and reviews

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged to proceed!");
        res.redirect("/login");
        return;
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
} 

module.exports.isOwner = async (req,res,next)=>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "Sorry, you dont have permission to perform action!");
        res.redirect(`/listings/${listing._id}`);
    }else{
        next();
    }
}

//sunction(middleware) for serverside validation for listings
module.exports.validatingListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(","); 
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

//function(middleware) for clientside validation of reviews
module.exports.validatingReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let msgErr = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

module.exports.isReviewAuthor = async(req,res,next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","Sorry, you are not the author of this review!");
        res.redirect(`/listings/${id}`);
    }else{
        next();
    }
}