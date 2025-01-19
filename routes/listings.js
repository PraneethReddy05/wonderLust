const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");//requiring listing model
const wrapAsync = require("../utils/wrspAsync.js");
const {isLoggedIn, isOwner , validatingListing} = require("../middleware.js");

//Index Route to show all listings
router.get("/", wrapAsync(async (req, res) => {
    let listings = await Listing.find({});
    res.render("index.ejs", { listings });
}));

//New listing route(get) to get form
router.get("/new", isLoggedIn, wrapAsync((req, res) => {
    res.render("form.ejs");
}));

//New listing route(post) to add new listing
router.post("/", isLoggedIn, validatingListing, wrapAsync(async (req, res, next) => {
    let { title, des, image, price, location, country } = req.body;
    let listing = new Listing({title: title,description: des,image: image,price: price,location: location,country: country,})
    listing.owner = req.user._id;
    await listing.save();
    req.flash("success","New listing created!");
    res.redirect("/listings");
}));

//Editing route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for doesnot exist!");
        res.redirect("/listings");
        return;
    }
    res.render("edit.ejs", { listing });
}));

//Update route
router.put("/:id", isLoggedIn, isOwner, validatingListing, wrapAsync(async (req, res) => {
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
    req.flash("success","Listing updated successfully!");
    res.redirect(`/listings/${id}`);
}));

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for doesnot exist!");
        res.redirect("/listings");
    }
    res.render("show.ejs", { listing });
}));

//Delete route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing successfully deleted!");
    res.redirect("/listings");
}));


module.exports = router;