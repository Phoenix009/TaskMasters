const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");

//mysql connection
var connection = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "root",
    database: "StationaryInventorySystem"
});

connection.connect(err=>{
    if(err) throw err;
    console.log("Connection established...");
});


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));



//Root Route
app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/views/index.html");
});


app.post("/", (req, res)=>{
    var email = req.body.email;
    var pass = req.body.pass;

    
    
});


app.listen(3000, ()=>{
    console.log("server running on port 3000");
});