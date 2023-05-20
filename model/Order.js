/* RMIT University Vietnam
Course: COSC2430 Web Programming
Semester: 2023A
Assessment: Assignment 2
Author/ID: 
Celina Vangstrup s3993395
Doan Tran Thien Phuc s3926377
Le Duy Quang s3912105
Gustav Joachim Elbroend s3995055
Damien Vincent Voelker s3995378
Acknowledgement: RMIT Lecture Slide*/

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://phucdoan:Phuc1234@cluster0.rxqfnek.mongodb.net/')
.then(() => console.log('Connected to MongoDB Atlas Order'))
.catch((error) => console.log(error.message));

const orderSchema = new mongoose.Schema({
    username: String,
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