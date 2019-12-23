const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));




var connection = mysql.createConnection({
    host:"localhost",
    user: "root",
    password: "root",
    database: "StationaryInventorySystem"
});

//connection
connection.connect(err=>{
    if(err) throw err;
    console.log("Connection established...");
});


// --------------------------------------------------------------

//Root Route
app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/views/index.html");
});


app.post("/", (req, res)=>{

    var data = {
        email: req.body.email,
        password: req.body.pass,
    };

    var query = "SELECT email FROM users WHERE ?" ;
    connection.query(query, data, (err, results, fields)=>{
        console.log(results);
    });
    
});


app.listen(3000, ()=>{
    console.log("server running on port 3000");
});