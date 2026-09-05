const mongoose = require("mongoose");

const connectDB = async ()=>{
    console.log(process.env.ojha)
    await mongoose.connect(process.env.DB_CONNECT_LINK);
}

module.exports = connectDB;