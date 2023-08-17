const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    UserId: String,
    ProductId: String,
    Quantity: Number

});

const carts = mongoose.model('carts', CartSchema, "carts");
module.exports = carts;