const mongoose = require("mongoose");
const Review = require("./review.js");
const Schema = mongoose.Schema;
const listingSchema = new Schema({
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
    reviews:[
        {
            type : Schema.Types.ObjectId,
            ref:"Review"
        }
    ]
})

//mongoose middleware to handle deletion in n-many schema
listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}});
    }
})
const Listing = new mongoose.model("Listing",listingSchema);
module.exports = Listing;