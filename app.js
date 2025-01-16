const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Listing = require("./models/listing.js");//requiring listing model
const Review = require("./models/review.js");//requiring review model
const path = require("path");
const ExpressError = require("./utils/ExpressErrors.js");

//Routers based on models
//listing router
const listings = require("./routes/listings.js");
//reviews router
const reviews = require("./routes/reviews.js");


async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/airbnb');
}
main().then(() => {
    console.log("connection successful");
}).catch(err => console.log(err));


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

//listings router 
app.use("/listings",listings);

//reviews router
app.use("/listings/:id/reviews",reviews);


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