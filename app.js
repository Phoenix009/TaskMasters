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
    password: "phoenix",  // password
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


app.get("/edit", (req, res)=>{
    res.render("edit", {err: false});
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
        prev_pass: req.body.prev_password,
        new_pass: req.body.new_password,
        c_pass: req.body.confirm_password,
    };

    var query = `SELECT * FROM users WHERE email = '${data.email}'`;
    connection.query(query, (err, results, fields)=>{
        if(err) throw err;
        else{
            if(results.length){
                if(passwordMatch(data.prev_pass, results[0].pass)){
                    if(data.new_pass === data.c_pass){
                        var pass = passwordHash(data.new_pass);
                        var query = `UPDATE users SET pass='${pass}' WHERE email='${data.email}'`;
                        connection.query(query, (err, results, fields)=>{
                            if(err) throw err;
                            else{
                                console.log("Profile updated successfully !!");
                                res.redirect("/");
                            }
                        })
                    }else{
                        res.send("new Pass and c pass dont match")
                    }
                }else{
                    res.send("!!Prev Password dont Match!!")
                }
            }else{
                res.send("!! Email does not exists !!")
            }
        }
    })
});


app.post("/add_item", (req, res)=>{
    var data = {
        item: req.body.item,
        qty_prev: 0,
        avail: req.body.stock,
        qty_req: req.body.qty_req,
        qty_pres: req.body.stock
    };

    var query = "INSERT INTO stock SET ?";
    connection.query(query, data, (err, results, fields)=>{
        if(err) throw err;
        else{
            console.log("Item added successfully");
            res.redirect("stocks");
        }
    })
})


app.listen(3000, ()=>{
    console.log("server running on port 3000");
});
