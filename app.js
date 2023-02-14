require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Line to avoid deprecation warning.
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = mongoose.Schema({
    email: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
    res.render("home");
});

app.route("/login")
    .get(function (req, res) {
        res.render("login");
    })
    .post(function (req, res) {
        const user = new User({
            email: req.body.username,
            password: req.body.password
        });
        req.login(user, function (err) {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/secrets");
                })
            }
        })
    });

app.route("/secrets")
    .get(function (req, res) {
        if (req.isAuthenticated) {
            res.render("secrets");
        } else {
            res.redirect("/login");
        }
    });

app.route("/register")
    .get(function (req, res) {
        res.render("register");
    })
    .post(function (req, res) {

        User.register({ email: req.body.username }, req.body.password, function (err, user) {
            if (err) {
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/secrets");
                })
            }
        })
    });

app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
})



app.listen(port, function () {
    console.log(`Server listening on port ${port}`);
});
