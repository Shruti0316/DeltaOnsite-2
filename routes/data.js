const express = require("express");
const router = express.Router();
const multer  = require('multer');
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const Media = require("../models/data");
const User = require("../models/user");
var username = "";

const storage = multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null, './uploads');
    },
    filename: function(req, file, callback) {
      callback(null,new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, callback) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'video/mp4') {
      callback(null, true);
    } else {
      callback(null, false);
    }
  }

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
})

router.get("/",(req,res) =>{
    res.render("login.ejs",{msg:""});
})
router.get("/login",(req,res) =>{
  res.render("login.ejs",{msg:""});
})
router.get("/signup",(req,res) =>{
  res.render("signup.ejs",{msg:""});
})
router.post("/signup", async (req, res) => {
  var username = req.body.name;
  var email = req.body.email;
  var pwd = req.body.password;
  if(username == "" || email == "" || pwd == ""){
    res.render("signup.ejs",{msg:"Fill all the Details"});
  }
  User.findOne({ name: username })
    .then(user => {
      if (user) {
        res.render("signup.ejs",{msg:"User Already Exists"});
      }
  })
  User.findOne({ email: email })
    .then(user => {
      if (user) {
        res.render("signup.ejs",{msg:"Email not available"});
      }
  })
  const salt = await bcrypt.genSalt()
  const hashedPassword = await bcrypt.hash(req.body.password,salt);
  const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    })
    newUser
    .save()
    .then(user => {
      res.redirect("/login");
    })
    .catch(err => {
      console.log(err);
    });
});
router.post("/login",(req,res)=>{
    User.findOne({name:req.body.name})
    .then(async(result) =>{
      if (result){
        var userid= await User.findOne({name:req.body.name});
        const isMatch = await bcrypt.compare(req.body.password,userid.password);
        if(isMatch){
          username=req.body.name;
          const img = await Media.find().select("_id Image url owner").exec();
          res.render("index.ejs",{img:img});
          }
        else{
          res.render("login.ejs",{msg:"Invalid Credentials"});
        }
      }
      else{
        res.render("login.ejs",{msg:"User Not Found"});
      }
    })
});

router.post("/upload",upload.single("media"),(req,res) => {
    const media = new Media({
        Image: new Date().toISOString() + req.file.originalname,
        url: req.file.path,
        owner : username
    })
    media
        .save()
        .then(async(result) => {
            const img = await Media.find().select("_id Image url owner").exec();
            res.render("index.ejs",{img:img})
        })
})
router.get("/delete/:id/:owner",(req,res)=>{
  if(req.params.owner === username){
  Media.findOne({owner: username,id: req.params.id, },(error,result)=>{
    console.log(result);
    if(result){
      Media.deleteOne({ _id: req.params.id })
      .exec()
      .then(async(result) => {
          console.log("deleted");
          const img = await Media.find().select("_id Image url owner").exec();
          res.render("index.ejs",{img:img})
        })
      .catch(err => {
        console.log(err);
        })
      }
      else if(error){
        console.log(error);
      }
    })
  }
  else{
    res.send("You dont have Permission to delete this file");
  }
});
//EXPORTING
module.exports = router;
