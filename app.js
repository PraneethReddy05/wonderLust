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
const cookieParser = require("cookie-parser");
const session = require("express-session"); // npm package for sessions
const flash = require("connect-flash"); // npm package for flash messages
const passport = require("passport");
const LocalStratagy = require("passport-local");
const User = require("./models/user.js");


const sessionOptions = {
    secret : "mysupersecretcode",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() * 1000*60*60*24*7,
        maxAge : 1000*60*60*24*7,
        httpOnly : true,
    },
}

app.get("/", (req, res) => {
    res.send("server successfully running");
})

//middleware for sessions
app.use(session(sessionOptions));
app.use(flash());

//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratagy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

//Routers based on models
//listing router
const listingRouter = require("./routes/listings.js");
//reviews router
const reviewRouter = require("./routes/reviews.js");
//user router
const userRouter = require("./routes/user.js");



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

//listings router 
app.use("/listings",listingRouter);

//reviews router
app.use("/listings/:id/reviews",reviewRouter);

//users router
app.use("",userRouter);


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