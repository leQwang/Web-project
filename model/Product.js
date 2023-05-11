const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://phucdoan:Phuc1234@cluster0.rxqfnek.mongodb.net/')
.then(() => console.log('Connected to MongoDB Atlas Product'))
.catch((error) => console.log(error.message))

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    businessName: String,
    image: {
        data: Buffer,
        contentType: String
    },
    description: String
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;