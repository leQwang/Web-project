const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://phucdoan:Phuc1234@cluster0.rxqfnek.mongodb.net/')
.then(() => console.log('Connected to MongoDB Atlas Order'))
.catch((error) => console.log(error.message));

const orderSchema = new mongoose.Schema({
    customerName: String,
    address: String,
    productList: [String],
    totalPrice: Number,
    state: {
        type: String,
        enum: ['active', 'shipped', 'canceled'],
    },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;