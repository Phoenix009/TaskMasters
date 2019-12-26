const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));


//-------------- UTIL FUNCTIONS --------------
function passwordHash(pass){
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(pass, salt);
    return hash;
}

function passwordMatch(pass, hash){
    return bcrypt.compareSync(pass, hash);
}


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


//-------------- GET ROUTES --------------
app.get("/", (req, res)=>{
    res.render("index", {"err": false});
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


//-------------- DEFAULT ROUTE --------------
app.get("*", (req, res)=>{
    res.send("Why are we here? Just to suffer ...");
});



//-------------- POST ROUTES --------------

app.post("/login", (req, res)=>{
    email = req.body.email;
    password =  req.body.password;

    var query = `SELECT * FROM users WHERE email='${email}';`;
    connection.query(query, (err, results, fields)=>{
        if(err) throw err;
        else{
            if(results.length){
                if(passwordMatch(password, results[0].pass)){
                    res.send("Logged in with "+ email);
                }else{
                    res.send("Passwords dont match");
                }
            }else{
                res.send("User does not exist");
            }
        }
    });
    
    
});


app.post("/register", (req, res)=>{
    var data = {
        email: req.body.email,
        pass: passwordHash(req.body.password),
    };

    var query = "INSERT INTO users SET ?";
    connection.query(query, data, (err, results, fields)=>{
        if(err) throw err;
        else{
            console.log("User added successfully");
            res.redirect("index");
        }
    });
});


app.listen(3000, ()=>{
    console.log("server running on port 3000");
});
