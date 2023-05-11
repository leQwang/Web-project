const mongoose = require('mongoose');
const Product = require('./Product');
const Schema = mongoose.Schema;

mongoose.connect('mongodb+srv://phucdoan:Phuc1234@cluster0.rxqfnek.mongodb.net/')
.then(() => console.log('Connected to MongoDB Atlas Order'))
.catch((error) => console.log(error.message))

const orderSchema = new mongoose.Schema({
    customerName: String,
    address: String,
    productList: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    totalPrice: Number,
    isShipped: Boolean
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;