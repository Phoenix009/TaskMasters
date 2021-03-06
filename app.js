const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const Json2csvParser = require("json2csv").Parser;
const fs = require("fs")

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: "SomeSecret"
}));

//-------------- UTIL FUNCTIONS --------------
function passwordHash(pass) {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(pass, salt);
    return hash;
}

function passwordMatch(pass, hash) {
    return bcrypt.compareSync(pass, hash);
}


//-------------- CONNECTION --------------
var connection = mysql.createConnection({
    host: "localhost",
    user: "root", //your username
    password: "phoenix", // password
    database: "StationeryManager"
});


connection.connect(err => {
    if (err) throw err;
    console.log("Connection established...");
});


//-------------- GET ROUTES --------------
app.get("/", (req, res) => {
    try {
        if (req.session.valid) { }
    } catch (err) {
        req.session.valid = false;
    }
    res.render("index", {
        "err": false,
        "err_msg": ""
    });
});


app.get("/request", (req, res) => {
    if (req.session.valid && req.session.admin) {
        var query = "SELECT requests.id AS req_id, stock.id AS stock_id, (avail-qty) AS qty_flag, user_id, avail, fname, lname, item, qty, date_time FROM users \
        JOIN requests ON users.id=user_id \
        JOIN stock on stock_id = stock.id WHERE req_status = 0 ORDER BY date_time DESC;";

        connection.query(query, (err, results, body) => {
            if (err) throw err;
            else {
                var options = {
                    weekday: "short",
                    month: "short",
                    year: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric"
                };

                results.forEach(element => {
                    var date = new Date(element.date_time);
                    element.date_time = date.toLocaleDateString("en-US", options);
                });
                // console.log(results);
                res.render("request", {
                    "body": results
                });
            }
        })
    } else if (req.session.valid && !req.session.admin) {
        res.redirect("/user");
    } else {
        res.render("index", {
            "err": false,
            "err_msg": ""
        });
    }
})


app.get("/stocks", (req, res) => {
    if (req.session.valid && req.session.admin) {
        var query = "SELECT * FROM stock";
        connection.query(query, (err, results, body) => {
            if (err) throw err;
            else {
                res.render("stocks", {
                    "body": results
                });
            }
        })
    } else if (req.session.valid && !req.session.admin) {
        res.redirect("/user");
    } else {
        res.render("index", {
            "err": false,
            "err_msg": ""
        });
    }
})


app.get("/edit", (req, res) => {
    if (req.session.valid) {
        res.render("edit", {
            err: false,
            email: req.session.email,
        });
    } else {
        res.render("index", {
            "err": false,
            "err_msg": ""
        });
    }
});


app.get("/edit_requests/:mode/:req_id/:stock_id/:user_id/:qty", (req, res) => {
    if (req.session.valid && req.session.admin) {
        var body = req.params;
        var stockQuery = `UPDATE stock SET avail= avail - ${body.qty} WHERE id=${body.stock_id}`;

        connection.query(stockQuery, (err, results, fields) => {
            if (err) throw err;
            else {
                console.log("Stocks updated");
            }
        })
        
        console.log("I am getting here")
        var reqQuery = `SELECT qty AS 'qty' FROM requests WHERE id = ${body.req_id}`;
        connection.query(reqQuery, (err, results, fields)=>{
            if(err) throw err
            else{
                console.log(results[0].qty);
                if(results[0].qty > body.qty){
                    var resQty = results[0].qty;
                    var query = `UPDATE requests SET qty=qty-${body.qty} WHERE id=${body.req_id}`;
                    connection.query(query, (err, results, fields)=>{
                        if(err) throw err;
                        else{
                            var query = `INSERT INTO requests(user_id, stock_id, qty, req_status) VALUES (${body.user_id}, ${body.stock_id}, ${body.qty}, ${1})`;
                            connection.query(query, (err, results, fields)=>{
                                if(err) throw err;
                                else{
                                    console.log("Done with the request update");
                                }
                            })
                        }
                    })
                }else{
                    var reqQuery = `UPDATE requests SET req_status=${1} WHERE id=${body.req_id}`;
                    connection.query(reqQuery, (err, results, fields) => {
                        if (err) throw err;
                        else {
                            console.log("Request Updated");
                        }
                    })
                }
                
            }
        })
        res.redirect("/request");
    } else {
        res.redirect("/");
    }
});

app.get("/user", (req, res) => {
    if (req.session.valid && !req.session.admin) {
        var query = `SELECT * FROM stock`;
        connection.query(query, (err, results, fields) => {
            if (err) throw err;
            else {
                var params = {
                    "body": results,
                };

                if (req.session.req_status) {
                    params["req_status"] = true;
                    req.session.req_status = false;
                } else {
                    params["req_status"] = false;
                }

                res.render("user", params);
            }
        })
    } else if (req.session.valid && req.session.admin) {
        res.redirect("/request");
    } else {
        res.redirect("/");
    }
});

app.get("/summary/:type", (req, res) => {
    if (req.session.valid) {
        if (req.params.type === "admin" && req.session.admin) {
            var query = `SELECT requests.id AS req_id, CONCAT(fname, " ", lname) AS name, item, qty, date_time, req_status FROM users \
            JOIN requests ON users.id=user_id \
            JOIN stock on stock_id = stock.id
            ORDER BY date_time DESC`;

            var options = {
                weekday: "short",
                month: "short",
                year: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric"
            };

            connection.query(query, (err, results, body) => {
                if (err) throw err;
                else {
                    results.forEach(element => {
                        var date = new Date(element.date_time);
                        element.date_time = date.toLocaleDateString("en-US", options);
                    });
                    res.render("summary", {
                        "body": results,
                        "adminFlag": true,
                    });
                }
            })
        } else if (req.params.type === "user") {
            var query = `SELECT requests.id AS req_id, item, qty, date_time, req_status FROM users \
            JOIN requests ON users.id=user_id \
            JOIN stock on stock_id = stock.id WHERE user_id=${req.session.user_id}
            ORDER BY date_time ASC`;

            connection.query(query, (err, results, body) => {
                if (err) throw err;
                else {
                    results.forEach(element => {
                        var date = new Date(element.date_time);
                        element.date_time = date.toLocaleDateString("en-US", options);
                    });
                    res.render("summary", {
                        "body": results,
                        "adminFlag": false,
                    });
                }
            })
        }
    } else {
        res.redirect("/");
    }
})

//-------------- DEFAULT ROUTE --------------
app.get("*", (req, res) => {
    res.send("Why are we here? Just to suffer ...");
});



//-------------- POST ROUTES --------------

app.post("/login", (req, res) => {
    email = req.body.email;
    password = req.body.password;
    adminFlag = req.body.adminFlag;

    var query = `SELECT * FROM users WHERE email='${email}';`;
    connection.query(query, (err, results, fields) => {
        if (err) throw err;
        else {
            if (results.length) {
                if (passwordMatch(password, results[0].pass)) {
                    req.session.valid = true;
                    req.session.email = email;
                    req.session.user_id = results[0].id;

                    if (adminFlag && results[0].admin_flag) {
                        req.session.admin = true;
                        res.redirect("/request")
                    } else {
                        req.session.admin = false;
                        res.redirect("/user");
                    }
                } else {
                    req.session.valid = false;
                    res.render("index", {
                        "err": true,
                        "err_msg": "Passwords dont match"
                    });
                }
            } else {
                req.session.valid = false;
                res.render("index", {
                    "err": true,
                    "err_msg": "User Does not Exist"
                });
            }
        }
    });
});


app.post("/register", (req, res) => {
    var data = {
        email: req.session.email,
        prev_pass: req.body.prev_password,
        new_pass: req.body.new_password,
        c_pass: req.body.confirm_password,
    };

    var query = `SELECT * FROM users WHERE email = '${data.email}'`;
    connection.query(query, (err, results, fields) => {
        if (err) throw err;
        else {
            if (results.length) {
                if (passwordMatch(data.prev_pass, results[0].pass)) {
                    if (data.new_pass === data.c_pass) {
                        var pass = passwordHash(data.new_pass);
                        var query = `UPDATE users SET pass='${pass}' WHERE email='${data.email}'`;
                        connection.query(query, (err, results, fields) => {
                            if (err) throw err;
                            else {
                                console.log("Profile updated successfully !!");
                                res.redirect("/");
                            }
                        })
                    } else {
                        res.render("edit", {
                            "err": true,
                            "err_msg": "New Password and Confirm Password don't match"
                        });
                    }
                } else {
                    res.render("edit", {
                        "err": true,
                        "err_msg": " Previous Password does not Match "
                    })
                }
            } else {
                res.render("edit", {
                    "err": true,
                    "err_msg": "Email does not exists"
                });
            }
        }
    })
});


app.post("/add_item", (req, res) => {
    var data = {
        item: req.body.item,
        qty_prev: 0,
        avail: req.body.stock,
        qty_req: req.body.qty_req,
        qty_pres: req.body.stock
    };

    var query = "INSERT INTO stock SET ?";
    connection.query(query, data, (err, results, fields) => {
        if (err) throw err;
        else {
            console.log("Item added successfully");
            res.redirect("stocks");
        }
    })
})

app.post("/edit_stocks", (req, res) => {
    console.log("Just entered edit stocks");
    var data = {
        id: Number(req.body.id),
        item: req.body.item_text,
        avail: Number(req.body.avail_text),
        qty_req: Number(req.body.qty_text),
    };

    var qry = `SELECT avail FROM stock WHERE id=${data.id}`;
    connection.query(qry, (err, results, fields) => {
        var diff = data.avail - results[0].avail;

        var query = `UPDATE stock SET item = '${data.item}', avail = ${data.avail}, qty_req = ${data.qty_req}, qty_pres = qty_pres + ${diff} WHERE id = ${data.id}`;
        connection.query(query, (err, results, fields) => {
            if (err) throw err;
            else {
                console.log("Item updated successfully");
                res.redirect("stocks");
            }
        })
    })
});


app.post("/make_request", (req, res) => {

    var data = {
        user_id: Number(req.session.user_id),
        stock_id: Number(req.body.id),
        qty: Number(req.body.qty),
    };

    var query = "INSERT INTO requests SET ?";
    connection.query(query, data, (err, results, fields) => {
        if (err) throw err;
        else {
            req.session.req_status = true;
            res.redirect("user");
        }
    })
});

app.post("/export", (req, res) => {
    var query = "SELECT id, item, qty_prev as 'Previous semester', avail as 'Available', qty_req as 'Quantity Required', qty_pres as 'Quantity present' FROM stock";
    connection.query(query, (err, results, body) => {
        if (err) throw err;
        else {
            var jsonData = JSON.parse(JSON.stringify(results));
            const json2csvParser = new Json2csvParser({
                header: true
            });
            const csv = json2csvParser.parse(jsonData);
            fs.writeFile(__dirname + "/public/downloads/stock.csv", csv, function (error) {
                if (error) throw error;
            });
            let rs = fs.createReadStream(__dirname + '/public/downloads/stock.csv');
            res.attachment("stock.csv");
            rs.pipe(res);
        }

    })
});

app.post("/reset", (req, res) => {
    var query = "SELECT id, item, qty_prev as 'Previous semester', avail as 'Available', qty_req as 'Quantity Required', qty_pres as 'Quantity present' FROM stock";
    connection.query(query, (err, results, body) => {
        if (err) throw err;
        else {
            var jsonData = JSON.parse(JSON.stringify(results));
            const json2csvParser = new Json2csvParser({
                header: true
            });
            const csv = json2csvParser.parse(jsonData);
            fs.writeFile(__dirname + "/public/downloads/stock.csv", csv, function (error) {
                if (error) throw error;
            });

            var query = "UPDATE stock SET qty_prev = qty_pres, qty_pres = 0, avail=0, qty_req=0";
            connection.query(query, (err, results, body) => {
                if (err) throw err;
            });
            let rs = fs.createReadStream(__dirname + '/public/downloads/stock.csv');
            res.attachment("stock.csv");
            rs.pipe(res);
        }
    });

})


app.post("/logout", (req, res) => {
    req.session.valid = false;
    res.redirect("/");
})

app.listen(3000, () => {
    console.log("server running on port 3000");
});