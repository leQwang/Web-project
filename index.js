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
const DistributionHub = require('./model/DistributionHub');

app.set('view engine', 'ejs');
app.use(express.static("Public"));  

const vendorUser = "645b7d6b1f02c16d3bb1321a";

// Use the `express.urlencoded` middleware to parse incoming form data
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json());

app.get("/productPage", (req, res) => {
    res.render('productPage', { products: products });
});

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
    const order = new Order(req.body);
    console.log(req.body);
    order.save()
    .then((order) => res.send(order))
    .catch((error) => res.send(error));
})

app.post("/hub", (req, res) => {
    const hub = new DistributionHub(req.body);
    console.log(req.body);
    hub.save()
    .then((hub) => res.send(hub))
    .catch((error) => res.send(error));
})

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

    Product.find()
    .then((products) => {
        //RMIT vendor product 
        User.findById(vendorUser)
            .then((user) => {
                const matchedProducts = products.filter(product => product.businessName ===  user.businessName);
                res.render("vendorProductView", {user : user, prod: matchedProducts});
            });
    })
    .catch((error) => console.log(error.message));
});

app.get("/vendorAddProduct", (req, res) => {
    res.render('vendorAddProduct', {});
});

app.post("/vendorAddProduct", (req, res) => {
    User.findById(vendorUser)
    .then((user) => {
        req.body.businessName = user.businessName;
        const product = new Product(req.body);

        product.save()
          .then(Product.find()
            .then((products) => {
                //RMIT vendor product 
                const matchedProducts = products.filter(product => product.businessName ===  user.businessName);
                res.render("vendorProductView", {user : user, prod: matchedProducts});
            }) 
            .catch((error) => console.log(error.message)) )
          .catch((error) => res.send(error));
    });
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
