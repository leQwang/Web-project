// static data for testing
const orders = require('./orders');
const products = require('./products.js');
const users = require('./users.js');

const express = require("express");
const fs = require("fs");
const app = express();
const port = 4200;

const User = require('./model/User');
const Order = require('./model/Order');
const Product = require('./model/Product');
const DistributionHub = require('./model/DistributionHub');

app.set('view engine', 'ejs');
app.use(express.static("Public"));

const currentUser = "645cce8b020e3bde5c979c79";

// Use the `express.urlencoded` middleware to parse incoming form data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.post("/vendorAddProduct", (req, res) => {
    const product = new Product(req.body);
    console.log(req.body);
    product.save()
    .then((product) => res.send(product))
    .catch((error) => res.send(error));
})

app.post("/registerCustomer", (req, res) => {
    const user = new User(req.body);
    console.log(req.body);
    user.save()
    .then((user) => res.send(user))
    .catch((error) => res.send(error));
})

app.post("/registerShipper", (req, res) => {
    const user = new User(req.body);
    console.log(req.body);
    user.save()
    .then((user) => res.send(user))
    .catch((error) => res.send(error));
})

app.post("/registerVendor", (req, res) => {
    const user = new User(req.body);
    console.log(req.body);
    user.save()
    .then((user) => res.send(user))
    .catch((error) => res.send(error));
})

app.post("/shoppingCart", (req, res) => {
    var arr = req.body.productList.split(",");
    req.body.productList = arr;
    console.log(req.body);
    const order = new Order(req.body);
    order.save()
    .then((order) => {
        DistributionHub.aggregate([{"$sample": {"size": 1}}])
        .then((randHub) =>{
            console.log(randHub);
            DistributionHub.findByIdAndUpdate(randHub,{ $push: {orderID : order._id}})
            Product.find()
            .then((products)=>{
                    res.render("productPage", {products : products});
                })
            })
        })
    .catch((error) => res.send(error));
})

app.post("/hub", (req, res) => {
    const hub = new DistributionHub(req.body);
    console.log(req.body);
    hub.save()
    .then((hub) => res.send(hub))
    .catch((error) => res.send(error));
})

app.post("/myAccount", (req, res) => {
    const user = new User(req.body);
    console.log(req.body);
    User.findByIdAndUpdate(currentUser, req.body)
    .then(() => {
        User.findById(currentUser)
        .then((user) => {
            res.render('myAccount', {user: user});
        })
    })
    .catch((error) => res.send(error));
})

app.get("/myAccount", (req, res) => {
    User.findById(currentUser)
    .then((user)=> {   
        res.render('myAccount', { user: user });
    })
    .catch((error) => res.send(error))
})

app.get("/product/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);
    Product.findById(id)
    .then((product) =>{
        console.log(product);
        res.render('productDetail', { product: product });
    })
    .catch((err) => {
        console.log(err);
    })
});

app.get("/products", (req, res) =>{
    Product.find()
    .then((products) => {
        console.log(products);
        res.render('productPage', { products: products });
    })
})

app.get("/shoppingCart", (req, res) => {
    User.findById(currentUser)
    .then((user) =>{
        res.render('shoppingCart', { user: user });
    })
    
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

app.post('/register', (req, res) => {
        // Log the form data received from the client
    console.log("Data received from the frontend for POST form:");
    console.log(req.body);
    res.render('registrationSuccesfull', {name: `${req.body.name}`});
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

