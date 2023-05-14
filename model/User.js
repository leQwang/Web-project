const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://phucdoan:Phuc1234@cluster0.rxqfnek.mongodb.net/')
.then(() => console.log('Connected to MongoDB Atlas User'))
.catch((error) => console.log(error.message))

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    profilePic: String,
    role: String,
    businessName: String,
    businessAddress: String,
    distributionHub: String,
    customerName: String,
    customerAddress: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;
