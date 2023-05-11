const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://phucdoan:Phuc1234@cluster0.rxqfnek.mongodb.net/')
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.log(error.message))

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    image: String,
    description: String,
    businessName: String
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;