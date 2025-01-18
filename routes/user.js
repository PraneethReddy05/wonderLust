const express = require("express");
const router = express.Router();
const User = require("../models/user.js");//requiring listing model
const wrapAsync = require("../utils/wrspAsync.js");
const ExpressError = require("../utils/ExpressErrors.js");
const passport = require("passport");

router.get("/signup",(req,res)=>{
    res.render("user/signup.ejs");
})

router.post("/signup", wrapAsync(async(req,res) => {
    try{
        let {username,email,password} = req.body;
        let newUser = new User({email,username});
        let registeredUser = await User.register(newUser,password);
        console.log(registeredUser);
        req.flash("success","welcome to wanderlust!");
        res.redirect("/listings");
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    }
}));

router.get("/login",(req,res)=>{
    res.render("user/login.ejs");
})

router.post("/login", passport.authenticate("local",{ failureRedirect:'/login',failureFlash:true}), async(req,res) =>{
    req.flash("success","Welcome back to wanderlust!");
    res.redirect("/listings");
});

module.exports = router;