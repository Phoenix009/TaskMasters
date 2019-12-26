const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
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
    res.render("index", {"err": false});
});


app.post("/", (req, res)=>{
    //user inputs
    email = req.body.email;
    password =  req.body.password;
    var query = `SELECT * FROM users WHERE email = '${email}' and pass = '${pass}'`;
    connection.query(query,  (err, results, fields)=>{
        if(results.length){
            res.send("<h1>Logged in with " + results[0].email + "</h1>")
        }else{
            res.render("index", {"err": true});
        }
    }); 
    
});

app.get("/request", (req, res)=>{
    var query = "SELECT fname, lname, item, date_time FROM users \
    JOIN requests ON users.id=user_id \
    JOIN stock on stock_id = stock.id;";
    
    connection.query(query, (err, results, body)=>{
        if(err) throw err;
        else{
            console.log(results);
            res.render("request", {"body": results});
        }
    })
})


app.get("/stocks", (req, res)=>{
    var query = "SELECT * FROM stock";
    connection.query(query, (err, results, body)=>{
        if(err) throw err;
        else{
            console.log(results);
            res.render("stocks", {"body": results});
        }
    })
})
//edit profile route

//default route
app.get("*", (req, res)=>{
    res.send("Why are we here? Just to suffer ...");
});


app.listen(3000, ()=>{
    console.log("server running on port 3000");
});
