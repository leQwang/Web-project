const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://phucdoan:Phuc1234@cluster0.rxqfnek.mongodb.net/')
.then(() => console.log('Connected to MongoDB Atlas User'))
.catch((error) => console.log(error.message))

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 15,
        unique: true,
        validate: {
            validator: function (v){
            var ch, length;
            length = v.length
                for (var i = 0; i < length; i++) {
                ch = v.charCodeAt(i);
                    if (!(ch > 47 && ch < 58) && !(ch > 64 && ch < 91) && !(ch > 96 && ch < 123)){ 
                        return false;
                    }
                }
                return true;
            },
            message: "Username must be alphanumeric"
        }
    },
    password: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
    },
    businessName: {
        type: String,
        required: function(){
            return this.role === 'vendor';
        },
        minLength: 5
    },
    businessAddress: {
        type: String,
        required: function(){
            return this.role === 'vendor';
        },
        minLength: 5
    },
    distributionHub: {
        type: String,
        required: function(){
            return this.role === 'shipper';
        },
    },
    customerName: {
        type: String,
        required: function(){
            return this.role === 'customer';
        },
        minLength: 5
    },
    customerAddress: {
        type: String,
        required: function(){
            return this.role === 'customer';
        },
        minLength: 5
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;