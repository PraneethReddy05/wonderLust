const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Listing = require("./models/listing.js");
const path = require("path");
const wrapAsync = require("./utils/wrspAsync.js");
const ExpressError = require("./utils/ExpressErrors.js");
const listingSchema = require("./schema.js");
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

const validatingListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(","); 
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

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
    let listing = await Listing.findById(id);
    res.render("show.ejs", { listing });
}));

//Delete route
app.delete("/listings/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
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