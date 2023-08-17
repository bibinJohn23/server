const express= require("express")
const { ApolloServer } = require('apollo-server-express');
const users = require('./models/users.js')
const products = require('./models/products.js')
const carts = require('./models/cart.js')
const app = express()
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const orders = require("./models/orderDetails.js");

require('./models/db.js');

function sendOtpByEmail(passedOtp,Email){
  console.log(Email,"Email in server for sending otp")
  return new Promise((resolve, reject)=>{
    var transporter = nodemailer.createTransport({
      service:'gmail',
      auth:{
        user:'shajujohin@gmail.com',
        pass:'jsaeakfdhsmlmiho'
      }
    })
    const mail_configs ={
      from:'shajujohin@gmail.com',
      to:Email,
      subject:'OTP',
      html: `<p>${passedOtp} is the One time Password for your Sign-Up attempt in gadgetZone.com</p>`
    }
    transporter.sendMail(mail_configs, function(error,info){
      if(error){
        console.log(error)
        return reject({message:`An error occured`})
      }
      return resolve({message:"OTP sent Successfully"})
    })
  })
}

app.get('/otp',(req,res)=>{
  let otp = '666';
  sendOtpByEmail(otp)
  .then(response => res.send(response.message))
  .catch(error => res.status(500).send(error.message))
})

app.use(express.static('public'))
app.listen('5000',function(){

console.log("Webserver is running...")
})

const typeDefs = `

  type user{
    _id: String!,
    UserName:String,
    Password:String,
    Email:String,
    Phone:String,
    UserType:String,
  }


  type product{
    _id: String,
    ProductName: String,
    Description: String,
    Image: String,
    Price: String,
    Category: String,
    Specification: String,
    Warranty: String,
    Shipping: String,
    Seller: String,
    Quantity: Int

  }

  type cart{
    _id: String,
    ProductId: String,
    UserId: String,
    Quantity: Int
  }

  
  type order {
    _id: String
    UserId: String
    firstName: String 
    lastName: String 
  }
 

  type token{
    Email: String,
    OTP: String
  }

  type Query {
      productList:[product] 
      userList:[user] 
      orderList:[order]
      productListById(_id: String): product 
      FetchCartItems(UserId:String!):[product]

      
  }

  type Mutation {
      UserLogin(Email:String!,Password:String!): user
      AddUser(UserName:String!,Password:String!,Email:String!,Phone: String!,UserType: String!): user
      signupVerification(Email: String!, OTP: String) :token
      otpChecker(Email: String!, OTP: String): token
      passwordUpdate(Email: String!, Password: String): user
      sendOtpWithEmail(Email:String!): token
      AddToCart(UserId:String!,ProductId:String!,Quantity:Int!): cart
      UpdateToCart(UserId:String!,ProductId:String!,Quantity:Int!): cart
      ItemRemoveCart(UserId:String!,ProductId:String!): cart
      AddOrder(UserId:String!,FirstName:String!,LastName:String!,MobileNumber:String!,Address: String!,City: String!,Province: String!,PinCode: String!,CardHolderName: String!,CardNumber: String!,CardExpiry: String!,CardCVV: String!,PaymentMethod: String!): cart   
      productUpdate(_id:String,ProductName:String,Image:String,Price:String,Category:String,Description:String): product
      productDelete(_id:String): product
      userDelete(_id:String): user
      orderDelete(_id:String): order
      productAdd(ProductName:String,Image:String,Price:String,Category:String,Description:String): product

  }
`;

const resolvers = {

    Query: {
        productList,
        userList,
        productListById,
        FetchCartItems, 
        orderList 
    },

    Mutation: {
        UserLogin,
        AddUser,
        signupVerification,
        otpChecker,
        sendOtpWithEmail,
        passwordUpdate,
        AddToCart,
        UpdateToCart,
        ItemRemoveCart,
        AddOrder,
        productUpdate,
        productDelete,
        userDelete,
        orderDelete,
        productAdd
    },
};


async function productAdd(_, { ProductName, Image, Price, Category, Description }) {
  try {
    const newProduct = await products.create({
      ProductName,
      Image,
      Price,
      Category,
      Description,
    });

    console.log("newProduct",newProduct);

    return newProduct;
  } catch (error) {
    console.error("Error adding product details:", error);
    throw error;
  }
}



async function productDelete(_, { _id }) {
  try {
    const deletedProduct = await products.findByIdAndDelete(_id);
    if (!deletedProduct) {
      throw new Error(`Product with ID ${_id} not found.`);
    }
    return deletedProduct;
  } catch (error) {
    console.error("Error deleting product", error);
    throw error;
  }
}

async function userDelete(_, { _id }) {
  try {
    const deletedUser = await users.findByIdAndDelete(_id);
    if (!deletedUser) {
      throw new Error(`User with ID ${_id} not found.`);
    }
    return deletedUser;
  } catch (error) {
    console.error("Error deleting user", error);
    throw error;
  }
}

async function orderDelete(_, { _id }) {
  try {
    const deletedOrder = await orders.findByIdAndDelete(_id);
    if (!deletedOrder) {
      throw new Error(`Order with ID ${_id} not found.`);
    }
    return deletedOrder;
  } catch (error) {
    console.error("Error deleting order", error);
    throw error;
  }
}

async function productUpdate(_,{ _id, ProductName,Image, Price, Category,Description}) {
  try {
    console.log("Image in product update",Image)
    const updatedProduct = await products.findByIdAndUpdate(
      _id,
      { ProductName,Image, Price, Category, Description},
      { new: true } // This option returns the updated document
    );

    return updatedProduct;
  } catch (error) {

    console.error("Error editing product details:", error);
    throw error;
  }
}

async function productList() {
    return (await products.find());
}
async function userList() {
  return await users.find({ UserType: "user" }); 
}

async function orderList() {
  try {
    const orderData = await orders.find();
    
    // const orderListWithUserNames = await Promise.all(orderData.map(async (order) => {
    //   const user = await users.findOne({ _id: order.UserId }, { UserName: 1 });
      
    //   return {
    //     _id: order._id,
    //     UserId: order.UserId,
    //     UserName: user.UserName,
    //     // ... other order fields you want to include
    //   };
    // }));
    
    return orderData;
  } catch (error) {
    throw new Error('Error fetching orders with user names: ' + error.message);
  }
}


async function productListById(_,{_id}){
  return (await(products.findById(_id)));
}

async function ItemRemoveCart(_,{UserId,ProductId}){
  console.log("UserId",UserId)
  console.log("ProductId",ProductId)
   try {
    const deletedCartItem = await carts.findOneAndDelete({ UserId: UserId, ProductId: ProductId });
    console.log(deletedCartItem,"deletedCartItem");
    if (!deletedCartItem) {
      throw new Error('Cart item not found');
    }

    return deletedCartItem;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
}

async function FetchCartItems(_,{UserId}){
  console.log(UserId,"UserId")
  // return (await carts.find({ UserId: UserId }));
  const userCart = await carts.find({ UserId: UserId });
  console.log(userCart,"Cart Items Fetched")
  const productIds = userCart.map((cartItem) => cartItem.ProductId);
  console.log("productIds",productIds)
    // Fetch details of products with the extracted ProductIds
  const productssd = await products.find({ _id: { $in: productIds } });
  console.log("productssd",productssd);

  const cartItemsWithProductDetails = productssd.map((product) => {
    const cartItem = userCart.find((cartItem) => cartItem.ProductId === product._id.toString());
    const quantity = cartItem ? cartItem.Quantity : 0;
    return { ...product._doc, Quantity: quantity };
  });
  
  console.log("cartItemsWithProductDetails",cartItemsWithProductDetails);
  return cartItemsWithProductDetails;
}


async function generateRandomNumber() {
  return Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
}


async function sendOtpWithEmail(_,{ Email,}){
     
  let otp = await generateRandomNumber();
  await sendOtpByEmail(otp);
  let otpString = otp.toString();
  let token = {
    Email: Email,
  };
  console.log(token);
  try {
    const data = await users.updateOne(
      { Email: token.Email },
      {
        $set: {
          'Verification.OTP': otpString
        }
      }
      
    ).then(result => {
      console.log('Verification.OTP sett');
    })
    .catch(error => {
      console.error('Error updating document: Verification.OTP', error);
    });
    return (token);

    }
   catch (error) {
    // Handle any errors that occurred during the query
    console.error(error);
    throw error;
  }
}


async function signupVerification(_, { Email}) {
  console.log(Email,"Email in signup verification in server !!!!!!!!!!!!!!!")
  let otp = await generateRandomNumber();
  await sendOtpByEmail(otp,Email);
  let otpString = otp.toString();
  let token = {
    Email: Email,
  };
  console.log(token);
  try {
    const data = await users.updateOne(
      { Email: token.Email },
      {
        $set: {
          'Verification.OTP': otpString
        }
      }
      
    ).then(result => {
      console.log('Verification.OTP sett');
    })
    .catch(error => {
      console.error('Error updating document: Verification.OTP', error);
    });
    return (token);

    }
   catch (error) {
    // Handle any errors that occurred during the query
    console.error(error);
    throw error;
  }
  // var reponseList = await users.findById(_id); 
}


async function passwordUpdate(_, { Email, Password}) {

  let token = {
    Email: Email,
    Password: Password
  };
  console.log("token",token)
    const data = await users.findOne({ Email: token.Email });
    if(data.Email == token.Email){
      const hash = await bcrypt.hash(token.Password, 10);
      await users.updateOne(
        { Email: token.Email },
        {
          $set: {
            Password: hash
          }
        }
        
      );
      console.log("Password Updated;");
      return(token);
    }else{
      console.log("Password not Updated;");
      return(false);
  }
}


async function otpChecker(_, { Email, OTP}) {

  let token = {
    Email: Email,
    OTP: OTP
  };
    const data = await users.findOne({ Email: token.Email });
    if(data.Verification.OTP == token.OTP){
      console.log("otp matched;");
      await users.updateOne(
        { Email: token.Email },
        {
          $set: {
            'Verification.Status': true
          }
        }
        
      );
      return(token);
    }else{
      console.log("otp not matched;");
      return(false);
  }
}


async function UserLogin(_, { Email, Password }) {
    let user = {
      Email: Email,
      Password: Password
    };

    let passedData = {
      _id: "",
      UserType: ""
    };

  
    try {
      const data = await users.findOne({ Email: user.Email });
      if (data) {
        const match = await new Promise((resolve, reject) => {
          bcrypt.compare(Password, data.Password, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
  
        if (match) {
          passedData.UserType= data.UserType;
          passedData._id= data._id;
          return passedData;
        } else {
          return "false";
        }
      }
    } catch (error) {
      // Handle any errors that occurred during the query
      console.error(error);
      throw error;
    }
  }


  async function UpdateToCart(_,{UserId,ProductId,Quantity}){
    let cartItem={
      UserId:UserId,
      ProductId:ProductId,
      Quantity:Quantity,
      }
      console.log(cartItem,"cartItem data before checking cart");
      const data = await carts.findOne({ UserId: cartItem.UserId,ProductId: cartItem.ProductId });
      console.log(data,"cart data");
    if(data){
      const updatedCartItem = {
        ...data,
        Quantity: Quantity,
      };
  
      await carts.updateOne({ _id: data._id }, { Quantity: updatedCartItem.Quantity });
  
      console.log("Updated cart item:", updatedCartItem);
      return updatedCartItem;
    }else{
      // console.log("Item before adding cart item:",cartItem);
      const ItemAdded = await carts.create(cartItem);
      console.log("Added new cart item:",cartItem);
      return (ItemAdded);
    } 
  }

  
  async function AddToCart(_,{UserId,ProductId,Quantity}){
    let cartItem={
      UserId:UserId,
      ProductId:ProductId,
      Quantity:Quantity,
      }

      console.log(cartItem,"cartItem data before checking cart");
      const data = await carts.findOne({ UserId: cartItem.UserId,ProductId: cartItem.ProductId });
      console.log(data,"cart data");

    if(data){
      const updatedCartItem = {
        ...data,
        Quantity: data.Quantity + Quantity,
      };
  
      await carts.updateOne({ _id: data._id }, { Quantity: updatedCartItem.Quantity });
  
      console.log("Updated cart item:", updatedCartItem);
      return updatedCartItem;
    }else{
      // console.log("Item before adding cart item:",cartItem);
      const ItemAdded = await carts.create(cartItem);
      console.log("Added new cart item:",cartItem);
      return (ItemAdded);
    } 
  }

  async function AddUser(_,{UserName,Password,Email,Phone,UserType}){
      let user={
          UserName:UserName,
          Password:Password,
          Email:Email,
          Phone:Phone,
          UserType:UserType,
          }

         
      const data = await users.findOne({ Email: user.Email });
      if(data){
        return "false";
      }else{
        await users.create(user);
        console.log("userDetailsDb",user);
        return (user);
      } 
      
  }


  async function AddOrder(_,{UserId,FirstName,LastName,MobileNumber,Address,City,Province,PinCode,CardHolderName,CardNumber,CardExpiry,CardCVV,PaymentMethod}){
      let order={
          UserId:UserId,
          FirstName:FirstName,
          LastName:LastName,
          MobileNumber:MobileNumber,
          Address:Address,
          City:City,
          Province:Province,
          PinCode:PinCode,
          CardHolderName:CardHolderName,
          CardNumber:CardNumber,
          CardExpiry:CardExpiry,
          CardCVV:CardCVV,
          PaymentMethod:PaymentMethod,
          }

        console.log("orderDetailsDb",order);
        
        try {

          const cartItems = await carts.find({ UserId: order.UserId });

          // Create an array to store the order objects
          let ordersToAdd = [];

          // For each cart item, create an order object and add it to the 'ordersToAdd' array
          cartItems.forEach(cartItem => {
            const orderItem = {
              productId: cartItem.ProductId,
              quantity: cartItem.Quantity,
            };
            ordersToAdd.push(orderItem);
          });

          // Assuming you want to save the order details along with the existing user's orders in the database
          // const existingUser = await orders.findOne({ UserId: order.UserId });
      
          // if (existingUser) {
          //   existingUser.orders.push(order);
          //   await existingUser.save();
          // } else {

            // If the user doesn't exist, create a new user entry with the order
            const newUser = new orders({
              UserId: UserId,
              orders: ordersToAdd,
              firstName: FirstName,
              lastName: LastName,
              mobileNumber: MobileNumber,
              address: Address,
              city: City,
              province: Province,
              pinCode: PinCode,
            });
            ordersToAdd=[];
            console.log(newUser,"new order");
            console.log(ordersToAdd,"ordersToAdd");
            // await newUser.save();
            const addedorder = await orders.create(newUser);
            
          // }
          // const deletedCartItem = await carts.findOneAndDelete({ UserId: UserId, ProductId: ProductId });
          console.log("Order added successfully.");
          try {
            const deletedCartItem = await carts.findOneAndDelete({ UserId: UserId});
            console.log(deletedCartItem,"CartItems deleted");
            if (!deletedCartItem) {
              throw new Error('Cart item not found');
            }
          } catch (error) {
            console.error('Error removing items from cart:', error);
            throw error;
          }

          return addedorder;
        } catch (error) {
          console.error("Error adding order:", error);
          throw error;
        }    
  }

const server = new ApolloServer({
    typeDefs,
    resolvers
});

server.start()
    .then(function(){
        server.applyMiddleware({app, path:'/graphql', cors: true})
    })