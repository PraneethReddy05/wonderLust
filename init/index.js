let mongoose = require("mongoose");
let Listing = require("../models/listing.js");
const initData = require("../init/data.js");

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/airbnb');
}
main().then(()=>{
    console.log("connection successful");
})
.catch(err => console.log(err));

const initDB = async () => {
    // console.log(data);
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj,owner : "678afb6053024058009ca8f7"}));
    await Listing.insertMany(initData.data);
    console.log("successfully initialized database");
}

initDB();