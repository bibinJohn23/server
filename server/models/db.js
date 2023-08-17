const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://johinshaju:johin@cluster0.x1usphe.mongodb.net/users');
mongoose.connection.on("connected", function(){
    console.log("Application is connected to Database");
})