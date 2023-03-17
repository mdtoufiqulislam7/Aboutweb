const config = require("./config");
const mongoose = require("mongoose");




const URL = config.db.url;

mongoose.connect(URL)
.then(()=>{
    console.log("mongodb is connected")
}).catch((error)=>{
    console.log(error)
})

