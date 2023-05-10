// static data for testing
const orders = require('./orders');
const products = require('./products.js');
const users = require('./users.js');

const express = require("express");
const app = express();
const port = 4200;

const User = require('./model/User');
const Order = require('./model/Order');
const Product = require('./model/Product');
const Hub = require('./model/DistributionHub');

app.set('view engine', 'ejs');
app.use(express.static("Public"));
// Use the `express.urlencoded` middleware to parse incoming form data
app.use(express.urlencoded({ extended: true }));

app.get("/productPage", (req, res) => {
    res.render('productPage', { products: products });
});

app.get("/product/:id", (req, res) => {
    const { id } = req.params;
    const product = products.find((p) => p.id == id);
    res.render('productDetail', { product });
});

app.get("/myAccount", (req, res) => {
    res.render('myAccount', { user: users[0] });
});

app.get("/shoppingCart", (req, res) => {
    res.render('shoppingCart', { products: products, user: users[0] });
});

app.get('/shipper', (req, res) => {
    res.render('shipper', { orders: orders });
});

app.get("/login", (req, res) => {
    res.render('login', {});
});

app.get("/registerCustomer", (req, res) => {
    res.render('registerCustomer', {});
});

app.get("/registerShipper", (req, res) => {
    res.render('registerShipper', {});
});

app.get("/registerVendor", (req, res) => {
    res.render('registerVendor', {});
});

app.get("/vendorProductView", (req, res) => {
    res.render('vendorProductView', {users: users});
});

app.get("/vendorAddProduct", (req, res) => {
    res.render('vendorAddProduct', {});
});

app.post('/register', (req, res) => {
        // Log the form data received from the client
    console.log("Data received from the frontend for POST form:");
    console.log(req.body);
    res.render('registrationSuccesfull', {name: `${req.body.name}`});
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
