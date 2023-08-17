const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ProductsSchema = new Schema({
    ProductName: String,
    Description: String,
    Image: String,
    Price: String,
    Category: String,
    Specification: String,
    Warranty: String,
    Shipping: String,
    Seller: String

});

const products = mongoose.model('products', ProductsSchema, "products");
module.exports = products;