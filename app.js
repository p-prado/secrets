require('dotenv').config();
console.log(process.env); // remove this after you've confirmed it is working
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


// Line to avoid deprecation warning.
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = mongoose.Schema({
    email: String,
    password: String
});

// This adds _ct and _ac fields to the schema, as well as pre 'init' and pre 'save' middleware,
// and encrypt, decrypt, sign, and authenticate instance methods

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields:["password"]});

const User = new mongoose.model("User", userSchema);


app.get("/", function (req, res) {
    res.render("home");
});

app.route("/login")
    .get(function (req, res) {
        res.render("login");
    })
    .post(function (req, res) {
        const username = req.body.username;
        const password = req.body.password;
        User.findOne({ email: username }, function (err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                if (foundUser) {
                    if (password === foundUser.password) {
                        res.render("secrets");
                    } else {
                        console.log(`THE PASSWORDS DO NOT MATCH! ${password} != ${foundUser.password}`);
                        res.redirect("/login");
                    }
                } else{
                    console.log("NO USER FOUND");
                    res.send("NO USER FOUND");
                }
            }
        });

    });



app.route("/register")
    .get(function (req, res) {
        res.render("register");
    })
    .post(function (req, res) {
        User.create({
            email: req.body.username,
            password: req.body.password
        }, function (err) {
            if (err) {
                res.send(err);
            } else {
                res.render("secrets");
            }
        });
    });



app.listen(port, function () {
    console.log(`Server listening on port ${port}`);
});
