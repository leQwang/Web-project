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
const { Schema, default: mongoose } = require('mongoose');
const user = require('./users.js');

app.set('view engine', 'ejs');

app.use(express.static("Public"));  

const vendorUser = "645b7d6b1f02c16d3bb1321a";


const currentUser = "645cce8b020e3bde5c979c79";

// Use the `express.urlencoded` middleware to parse incoming form data
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json());

app.get("/products", (req, res) => {
    Product.find()
    .then((products) => {
        res.render('productPage', {products: products});
    })
    .catch((error) => console.log(error.message));
});



app.post("/vendorAddProduct", (req, res) => {
    const product = new Product(req.body);
    console.log(req.body);
    product.save()
        .then((product) => res.send(product))
        .catch((error) => res.send(error));
        .then((product) => res.send(product))
        .catch((error) => res.send(error));
})

app.post("/registerCustomer", (req, res) => {
    req.body.role = 'Customer';
    const data = req.body;
    const user = new User({ username: data.username, password: data.password, profilePic: data['profile-picture'], customerName: data['name'], customerAddress: data['address'], role: data.role });

    user.save()
        .then(() => res.render('registrationSuccesfull', { name: `${req.body.username}` }))
        .then((user) => res.send(user))
        .catch((error) => res.send(error));
})

app.post("/registerShipper", (req, res) => {
    req.body.role = 'Shipper';
    const data = req.body;
    const user = new User({ username: data.username, password: data.password, profilePic: data['profile-picture'], distributionHub: data['distribution-hub'], role: data.role });

    user.save()
        .then(() => res.render('registrationSuccesfull', { name: `${req.body.username}` }))
        .then((user) => res.send(user))
        .catch((error) => res.send(error));
})

app.post("/registerVendor", (req, res) => {
    req.body.role = 'Vendor';
    const data = req.body;
    const user = new User({ username: data.username, password: data.password, profilePic: data['profile-picture'], businessName: data['business-name'], businessAddress: data['business-address'], role: data.role });

    user.save()
        .then(() => res.render('registrationSuccesfull', { name: `${req.body.username}` }))
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

app.get("/products/filter", (req, res) => {
    const minPrice = req.query['min-price'];
    const maxPrice = req.query['max-price'];

    Product.find({price: {$gte: minPrice, $lte: maxPrice}})
    .then((products) => {
        res.render('productPage', {products: products});
    })
    .catch((error) => console.log(error.message));

});

app.get("/products/search", (req, res) => {
    const searchWord = req.query['search-word'];
    const regexPattern = new RegExp(searchWord, 'i');
  
    Product.find({ name: { $regex: regexPattern } })
      .then((products) => {
        res.render('productPage', { products: products });
      })
      .catch((error) => console.log(error.message));
});



app.get("/product/:id", (req, res) => {
    Product.findById(req.params.id)
    .then((product) => {
      if (!product) {
        return res.send("Cannot find that ID!");
      }
      res.render('productDetail', {product: product});
    })
    .catch((error) => res.send(error));
});


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

app.get("/shoppingCart", (req, res) => {
    User.findById(currentUser)
    .then((user) =>{
        res.render('shoppingCart', { user: user });
    })
    
});

app.get('/shipper', (req, res) => {
    Order.find()
        .then((orders) => {
            res.render('shipper', { orders: orders });
        })
        .catch((error) => console.log(error.message));
});

app.get("/orders/:id", async (req, res) => {
    let productsOfOrder = [];
    let orderData;
    await Order.findById(req.params.id)
        .then((order) => {
            orderData = order;
            order.productList.forEach((productId, index) => {
                Product.findById(productId)
                    .then((product) => {
                        productsOfOrder.push(product)
                    })
                    .catch((error) => error.message);
            });
        })
        .catch((error) => console.log(error.message));
        console.log(productsOfOrder)
    res.render('order', { order: orderData, products: productsOfOrder });
});

app.get("/login", (req, res) => {
    res.render('login', {});
});

app.get("/registerCustomer", (req, res) => {
    res.render('registerCustomer', {});
});

app.get("/registerShipper", (req, res) => {
    Hub.find()
    .then((hubs) => {
        res.render('registerShipper', {hubs: hubs})
    })
    .catch((error) => console.log(error))
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
    res.render('registrationSuccesfull', { name: `${req.body.name}` });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

