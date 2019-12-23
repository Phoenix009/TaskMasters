const express = require("express");
const app = express();
app.use(express.static("public"));

//Root Route
app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/views/index.html");
});



app.listen(3000, ()=>{
    console.log("server running on port 3000");
});