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

    //user inputs
    email = req.body.email;
    password =  req.body.password;
    var query = "SELECT * FROM users WHERE email = '" +email + "' AND password = '" + password + "'";
    // res.send(query);
    connection.query(query,  (err, results, fields)=>{
        if(!(results === undefined)){
            res.send("<h1>Logged in with " + results[0].email + "</h1>")
        }else{
            res.sendFile(__dirname + "/views/index.html");
        }
    }); 
});


app.listen(3000, ()=>{
    console.log("server running on port 3000");
});