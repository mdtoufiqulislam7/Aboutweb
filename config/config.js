require("dotenv").config();




const dav= {

    db:{
        url: process.env.db_url || "mongodb://localhost:2701/clintsdata"
    } 
}

module.exports = dav;