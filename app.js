const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const port =6060;
//INITIALIZES APP
const app = express();

//CONNECTING WITH DB
mongoose.connect("mongodb://localhost/onsite");
let db = mongoose.connection;

db.once("open",function(){
    console.log("Successfully connected to database");
}).on("error",function(error){
    console.log(error);
})

app.set("view-engine","ejs");

//BODY PARSER
app.use(express.urlencoded({ extended: false }));

//SETTING ROUTES
app.use("/",require("./routes/data"));

//STATIC FILES
app.use('/public', express.static('public'));
app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});