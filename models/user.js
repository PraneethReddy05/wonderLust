const mongoose = require("mongoose");
const schema = mongoose.Schema;
const passportLoscalMongoose = require("passport-local-mongoose");


const userSchema = new schema({
    email:{
        type:String,
        required:true,
    }
});

userSchema.plugin(passportLoscalMongoose);//adds username,salt,hash fields in the document and also
//adds some inportant methods to the model

module.exports = mongoose.model("User",userSchema);