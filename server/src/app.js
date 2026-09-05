const express = require('express');
require("dotenv").config();
const connectDB = require("./config/database")

const app = express();

app.use(express.json());

const authRouter = require("./routes/auth");

app.use("/",authRouter);

connectDB()
    .then(()=>{
        console.log("Database Connected Succesfully");
        app.listen(3000,()=>{
            console.log("Server Started at Port 3000");
        })
    })
    .catch((err)=>{
        console.log("Error : DataBase can't Connect " + err.message);
    })