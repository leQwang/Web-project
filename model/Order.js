const mongoose = require('mongoose');

// mongoose.connect('mongodb+srv://phucdoan:Phuc1234@cluster0.rxqfnek.mongodb.net/')
// .then(() => console.log('Connected to MongoDB Atlas'))
// .catch((error) => console.log(error.message))

const orderSchema = new mongoose.Schema({
    customerName: String,
    address: String,
    productList: [String],
    totalPrice: Number,
    isShipped: Boolean
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;