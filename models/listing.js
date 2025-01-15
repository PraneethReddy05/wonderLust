const mongoose = require("mongoose");
const schema = mongoose.Schema;
const listingSchema = new schema({
    title:{
        type:String,
        required:true,
    },
    description: String,
    image:{
        type : String,
        default:"https://i0.wp.com/picjumbo.com/wp-content/uploads/white-winter-christmas-background-free-image.jpeg?w=2210&quality=70",
        set : (v) => v === "" ? "https://i0.wp.com/picjumbo.com/wp-content/uploads/white-winter-christmas-background-free-image.jpeg?w=2210&quality=70":v,
    },
    price:Number,
    location:String,
    country:String,
})
const Listing = new mongoose.model("Listing",listingSchema);
module.exports = Listing;