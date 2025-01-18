const express = require("express");
const router = express.Router();
const User = require("../models/user.js");//requiring listing model
const wrapAsync = require("../utils/wrspAsync.js");
const ExpressError = require("../utils/ExpressErrors.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");

router.get("/signup",(req,res)=>{
    res.render("user/signup.ejs");
})

router.post("/signup", wrapAsync(async(req,res,next) => {
    try{
        let {username,email,password} = req.body;
        let newUser = new User({email,username});
        let registeredUser = await User.register(newUser,password);//just stores the new user in the database
        // console.log(registeredUser);
        req.login(registeredUser,(err)=>{
            if(err){
                next(err);
            }
            req.flash("success","Welcome to wonderlust!");
            res.redirect("/listings");
        })
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

router.post("/login",saveRedirectUrl, passport.authenticate("local",{ failureRedirect:'/login',failureFlash:true}), async(req,res) =>{
    req.flash("success","Welcome back to wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
});

router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            next(err);
        }
        req.flash("success","logout successful!");
        res.redirect("/listings");
    })
});
module.exports = router;