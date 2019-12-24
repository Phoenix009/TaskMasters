const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));




var connection = mysql.createConnection({
    host:"localhost",
    user: "root", //your username
    password: "root",  // password
    database: "StationeryManager"
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
    //user inputs
    email = req.body.email;
    password =  req.body.password;
    var query = "SELECT * FROM users WHERE email = '" +email + "' AND pass = '" + password + "'";
    connection.query(query,  (err, results, fields)=>{
        if(results.length){
            res.send("<h1>Logged in with " + results[0].email + "</h1>")
        }else{
            // res.send("Incorrect login details");
            res.sendFile(__dirname + "/views/index.html");
        }
    }); 
    
});

//default route
app.get("*", (req, res)=>{
    res.send("Why are we here? Just to suffer ...");
});


app.listen(3000, ()=>{
    console.log("server running on port 3000");
});