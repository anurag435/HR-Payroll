const express = require("express");
const authRouter = express.Router();

authRouter.get("/auth",(req,res)=>{
    try{
        res.json({msg:"This is just check"});
    }
    catch(err) {
        res.json({error:err});
    }
    
})

module.exports = authRouter;