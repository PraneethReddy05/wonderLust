const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Listing = require("./models/listing.js");//requiring listing model
const Review = require("./models/review.js");//requiring review model
const path = require("path");
const wrapAsync = require("./utils/wrspAsync.js");
const ExpressError = require("./utils/ExpressErrors.js");
const {listingSchema, reviewSchema}= require("./schema.js");//requiting joy schema for server side validation of Listings and reviews
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/airbnb');
}
main().then(() => {
    console.log("connection successful");
})
    .catch(err => console.log(err));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }));// middleware for making data understandable(parse) by express
app.use(express.json());
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);

app.get("/", (req, res) => {
    res.send("server successfully running");
})

//sunction(middleware) for serverside validation for listings
const validatingListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(","); 
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

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

//Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    let listings = await Listing.find({});
    res.render("index.ejs", { listings });
}));

//New listing route(get)
app.get("/listings/new", wrapAsync((req, res) => {
    res.render("form.ejs");
}));

//New listing route(post)
app.post("/listings",validatingListing, wrapAsync(async (req, res, next) => {
    let { title, des, image, price, location, country } = req.body;
    let listing = new Listing({title: title,description: des,image: image,price: price,location: location,country: country,})
    await listing.save();
    res.redirect("/listings");
}));

//Editing route
app.get("/listings/:id/edit",validatingListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("edit.ejs", { listing });
}));

//Update route
app.put("/listings/:id",validatingListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let { title, des, image, price, location, country } = req.body;
    await Listing.updateOne({ _id: id }, {
        title: title,
        description: des,
        image: image,
        price: price,
        location: location,
        country: country,
    })
    // await Listing.findByIdAndUpdate(id,{...req.body.listing})
    res.redirect(`/listings/${id}`);
}));

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    res.render("show.ejs", { listing });
}));

//Delete route
app.delete("/listings/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));


//Reviews
//Adding new review
app.post("/listings/:id/reviews", validatingReview, wrapAsync(async(req,res)=>{
    // console.log(req.body.review);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log(listing);
    res.redirect(`/listings/${listing._id}`);
    // console.log(newReview);
}));

//deleting a review
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res)=>{
    let { id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

//404 status error
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

//Error handling middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message="Something went wrong!" } = err;
    // res.status(statusCode).send(message);
    res.render("error.ejs",{message});
})

app.listen(port, () => {
    console.log(`server runnung on ${port}`);
})