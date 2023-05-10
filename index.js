// static data for testing
const orders = require('./orders');
const products = require('./products.js');
const users = require('./users.js');

const express = require("express");
const app = express();
const port = 4200;

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

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
