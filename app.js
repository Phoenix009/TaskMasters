const express = require("express");
const app = express();

//Root Route
app.get("/", (req, res)=>{
    res.send("Home Page");
});  



app.listen(3000, ()=>{
    console.log("server running on port 3000");
});