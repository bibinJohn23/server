const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
  UserId: String ,
  orders: [
    {
      productId: { type: String, ref: 'Product' },
      quantity: { type: Number, default: 1 },
    }
  ],
  firstName: String,   
  lastName: String,    
  mobileNumber: String,
  address: String,  
  city: String,  
  province: String,   
  pinCode: String,   
});

const orders = mongoose.model('orders', OrderSchema, 'orders');
module.exports = orders;
