const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
    UserName: String,
    Password: String,
    Email: String,
    Phone: String,
    UserType: {
        type: String,
        default: 'user'
    },
    Verification:{
        Status:{
            type: Boolean,
            default: false
        },
        OTP:{
            type: String,
            default: ''
        }
    },
});

UserSchema.pre('save', function(next){
    const pwd = this;

    bcrypt.hash(pwd.Password, 10, (error,hash) =>{
        pwd.Password=hash;
        next();
    })
})

const users = mongoose.model('users', UserSchema, "users");
module.exports = users;