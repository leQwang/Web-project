const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://phucdoan:Phuc1234@cluster0.rxqfnek.mongodb.net/')
.then(() => console.log('Connected to MongoDB Atlas Distribution Hub'))
.catch((error) => console.log(error.message))

const distributionHubSchema = new mongoose.Schema({
    name: String,
    address: String,
    shipperID: [String],
    orderID: [String]
});

const DistributionHub = mongoose.model('DistributionHub', distributionHubSchema);

module.exports = DistributionHub;

