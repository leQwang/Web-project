/* RMIT University Vietnam
Course: COSC2430 Web Programming
Semester: 2023A
Assessment: Assignment 2
Author/ID: 
Celina Vangstrup s3993395
Doan Tran Thien Phuc s3926377
Le Duy Quang s3912105
Gustav Joachim Elbroend s3995055
Damien Vincent Voelker s3995378
Acknowledgement: RMIT Lecture Slide, Express-session*/


// static data for testing
//const orders = require('./orders');
//const products = require('./products.js');

const express = require("express");
const session = require('express-session');
const fs = require('fs');
const app = express();
const port = 4200;

const User = require('./model/User');
const Order = require('./model/Order');
const Product = require('./model/Product');
const DistributionHub = require('./model/DistributionHub');
const { Schema, default: mongoose } = require('mongoose');
const { error } = require('console');
const { hashPassword, decryptHashedPassword } = require('./public/js/hashing');

app.set('view engine', 'ejs');
app.use(express.static("Public"));

// Use the `express.urlencoded` middleware to parse incoming form data
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json());
//Middleware session
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Apply middleware to all routes except for login and registration
app.use((req, res, next) => {
    if (req.path === '/login' || req.path === '/registerCustomer' || req.path === '/registerVendor' || req.path === '/registerShipper' || req.path === '/login-processing' || req.path === '/registrationSuccesfull') {
        next();
    } else {
        isAuthenticated(req, res, next);
    }
});

//Check if the user is valid to proceed or display access denied
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId ) {
        res.redirect('/login');
    }else if(req.session.userId && req.session.role === "Customer" && req.path.startsWith('/orders/')){
        next();
    }else if(req.session.userId && req.session.role !== "Customer" && (req.path=== '/myOrders' ||req.path=== '/shoppingCart')){
        res.send("<center><h1>Access Denied! Please go back.</h1></center>")
    }else if(req.session.userId && req.session.role !== "Vendor" && (req.path=== '/vendorAddProduct' || req.path=== '/vendorProductView')) {
        //if you are not a vendor user, you can't access vendorProductView and vendorAddProduct page
        res.send("<center><h1>Access Denied! Please go back.</h1></center>")
    }else if(req.session.userId && (req.session.role !== "Shipper") && (req.path=== '/shipper' || req.path.startsWith('/orders/'))){
        res.send("<center><h1>Access Denied! Please go back.</h1></center>")
    }else if(req.session.userId){
        next();
    }else{
        res.redirect('*');
    }
};

//ROUTE TO LOGIN AND REGISTRATION
app.get("/login", (req, res) => {
    res.render('login', {});
});

app.get("/registerCustomer", (req, res) => {
    res.render('registerCustomer', { error: "" });
});

app.get("/registerShipper", (req, res) => {
    DistributionHub.find()
        .then((hubs) => {
            res.render('registerShipper', { hubs: hubs, error: "" })
        })
        .catch((error) => console.log(error))
});

app.get("/registerVendor", (req, res) => {
    res.render('registerVendor', { error: "" });
});

//METHOD TO PROCESS LOGIN VALIDATION
app.post("/login-processing", async (req, res) => {
    const username = req.body.username;
    const passwordPlain = req.body.password;

    try {
        const user = await User.findOne({ username: username })
        if (!user) {
            return res.status(400).send('Invalid credentials (Username)');
        }

        const isMatch = await decryptHashedPassword(passwordPlain, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials (Password)');
        }

        // Passwords match, so create a session and redirect to product page
        req.session.userId = user._id;
        req.session.role = user.role;
        if (user.role == "Vendor") {
            res.redirect('/vendorProductView');
        } else if (user.role == "Customer") {
            res.redirect('/products');
        } else if (user.role == "Shipper") {
            res.redirect('/shipper');
        }

    } catch (error) {
        console.log(error);
        console.log("Error login process");
        res.status(500).send('Internal Server Error');
    }
})

//METHOD TO REGISTER A CUSTOMER
app.post("/registerCustomer", async (req, res) => {
    req.body.role = 'Customer';
    const defaultPic = fs.readFileSync('public/images/placeholder.png', {encoding: 'base64'});
    console.log(req.body.profilePic);
    const data = req.body;
    if(data['profile-picture'] === ""){
        data['profile-picture'] = "data:image/png;base64," + defaultPic;
    }
    const password = req.body.password;
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,20}/;
    const hashedPassword = await hashPassword(password);
    const dupUsername = await User.findOne({ username: data.username });
    if (dupUsername === null) {
        if (regex.test(password)) {
            console.log(hashedPassword);
            const user = new User({ username: data.username, password: hashedPassword, profilePic: data['profile-picture'], customerName: data['name'], customerAddress: data['address'], role: data.role });
            console.log(user)
            user.save()
                .then(() => res.render('registrationSuccesfull', { name: `${req.body.username}` }))
                .then((user) => res.send(user))
                .catch((error) => res.send(error));
        } else {
            res.render("registerCustomer", { error: "Server-side password validation failed!" })
        }
    } else {
        res.render("registerCustomer", { error: "Username is taken" })
    }
})

//METHOD TO REGISTER A SHIPPER
app.post("/registerShipper", async (req, res) => {
    req.body.role = 'Shipper';
    const defaultPic = fs.readFileSync('public/images/placeholder.png', {encoding: 'base64'});
    console.log(req.body.profilePic);
    const data = req.body;
    if(data['profile-picture'] === ""){
        data['profile-picture'] = "data:image/png;base64," + defaultPic;
    }
    const password = req.body.password;
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,20}/;
    const hashedPassword = await hashPassword(password);
    const dupUsername = await User.findOne({ username: data.username });
    const hubs = await DistributionHub.find();
    if (dupUsername === null) {
        if (regex.test(password)) {
            console.log(hashedPassword);
            const user = new User({ username: data.username, password: hashedPassword, profilePic: data['profile-picture'], distributionHub: data['distribution-hub'], role: data.role });
            console.log(user)
            user.save()
                .then(async (user) => {
                    selectedHub = await DistributionHub.findOneAndUpdate({ name: user.distributionHub }, { $push: { shipperID: user._id } }, { new: true });
                    res.render('registrationSuccesfull', { name: `${req.body.username}` })
                })
                .then((user) => res.send(user))
                .catch((error) => res.send(error));
        } else {
            res.render('registerShipper', { hubs: hubs, error: "Server-side password validation failed!" })
        }
    } else {
        res.render('registerShipper', { hubs: hubs, error: "Username is taken" })
    }
})

//METHOD TO REGISTER A VENDOR
app.post("/registerVendor", async (req, res) => {
    req.body.role = 'Vendor';
    const defaultPic = fs.readFileSync('public/images/placeholder.png', {encoding: 'base64'});
    console.log(req.body.profilePic);
    const data = req.body;
    if(data['profile-picture'] === ""){
        data['profile-picture'] = "data:image/png;base64," + defaultPic;
    }
    const password = req.body.password;
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,20}/;
    const hashedPassword = await hashPassword(password);
    const dupUsername = await User.findOne({ username: data.username });
    const dupBusinessName = await User.findOne({ businessName: data['business-name'] });
    const dupBusinessAddress = await User.findOne({ businessAddress: data['business-address'] });
    var error = 0;
    var errorMessage = "";
    if (dupUsername !== null) {
        error++;
        errorMessage += "Username taken\n"
    }
    if (dupBusinessName !== null) {
        error++;
        errorMessage += " This business name is already registered\n"
    }
    if (dupBusinessAddress !== null) {
        error++;
        errorMessage += " This business address is already registered"
    }
    if (error == 0) {
        if (regex.test(password)) {
            console.log(hashedPassword);
            console.log(req.body);
            const user = new User({ username: data.username, password: hashedPassword, profilePic: data['profile-picture'], businessName: data['business-name'], businessAddress: data['business-address'], role: data.role });

            user.save()
                .then(() => res.render('registrationSuccesfull', { name: `${req.body.username}` }))
                .then((user) => res.send(user))
                .catch((error) => res.send(error));
        } else {
            res.render("registerVendor", { error: "Server-side password validation failed!" })
        }
    } else {
        res.render("registerVendor", { error: errorMessage })
    }

})

//ROUTE TO CUSTOMER PRODUCT PAGE
app.get("/products", (req, res) => {
    Product.find()
        .then((products) => {
            res.render('productPage', { products: products, role: req.session.role });
        })
        .catch((error) => console.log(error.message));
});

//METHOD TO FILTER PRODUCT
app.get("/products/filter", (req, res) => {
    const minPrice = req.query['min-price'];
    const maxPrice = req.query['max-price'];

    Product.find({ price: { $gte: minPrice, $lte: maxPrice } })
        .then((products) => {
            res.render('productPage', { products: products, role: req.session.role  });
        })
        .catch((error) => console.log(error.message));

});

//METHOD TO SEARCH FOR PRODUCT BY NAME
app.get("/products/search", (req, res) => {
    const searchWord = req.query['search-word'];
    const regexPattern = new RegExp(searchWord, 'i');

    Product.find({ name: { $regex: regexPattern } })
        .then((products) => {
            res.render('productPage', { products: products, role: req.session.role  });
        })
        .catch((error) => console.log(error.message));
});

//ROUTE TO PRODUCT DETAIL PAGE
app.get("/product/:id", (req, res) => {
    Product.findById(req.params.id)
        .then((product) => {
            if (!product) {
                return res.send("Cannot find that ID!");
            }
            res.render('productDetail', { product: product, role: req.session.role  });
        })
        .catch((error) => res.send(error));
});

//ROUTE TO MY ACCOUNT PAGE
app.get("/myAccount", (req, res) => {
    User.findById(req.session.userId)
        .then((user) => {
            res.render('myAccount', { user: user, role: req.session.role  });
        })
        .catch((error) => res.send(error))
})

//METHOD TO UPDATE USER PROFILE PICTURE
app.post("/myAccount", (req, res) => {
    const user = new User(req.body);
    User.findByIdAndUpdate(req.session.userId, req.body)
        .then(() => {
            User.findById(req.session.userId)
                .then((user) => {
                    res.render('myAccount', { user: user, role: req.session.role  });
                })
                .catch((error) => res.send(error));
        })
});

//ROUTE TO SHOPPING CART PAGE
app.get("/shoppingCart", (req, res) => {
    User.findById(req.session.userId)
        .then((user) => {
            res.render('shoppingCart', { user: user, role: req.session.role  });
        })

});

//METHOD TO CREATE A NEW ORDER
app.post("/shoppingCart", async (req, res) => {
    var arr = req.body.productList.split(",");
    req.body.productList = arr;
    console.log(req.body);
    req.body.state = 'active';
    const order = new Order(req.body);
    order.save()
    randHub = await DistributionHub.aggregate([{ "$sample": { "size": 1 } }])
    console.log(randHub);
    await DistributionHub.findByIdAndUpdate(randHub, { $push: { orderID: order._id } })
    res.redirect("/products")
})

//ROUTE TO MY ORDERS PAGE
app.get('/myOrders', async (req, res) => {
    const current = await User.findById(req.session.userId);
    const orders = await Order.find({username : current.username})
    res.render('shipper', {orders: orders, role: req.session.role })
});

//ROUTE TO SHIPPER HUB PAGE
app.get('/shipper', (req, res) => {
    shipperID = req.session.userId;
    DistributionHub.findOne({ 'shipperID': shipperID, },)
        .then((hub) => {
            if (hub == null) return res.send('ERROR: No hub associated with shipper');
            Order.find({ state: 'active', '_id': { $in: hub.orderID } })
                .then((orders) => {
                    res.render('shipper', { orders: orders, role: req.session.role, hub: hub  });
                })
        .catch((error) => res.send(error));
    });
});

//ROUTE TO ORDER DETAIL PAGE
app.get("/orders/:id", (req, res) => {
    Order.findById(req.params.id)
        .then((order) => {
            if (order == null) res.send("ERROR: Cannot find that ID");
            Product.find({
                '_id': { $in: order.productList }
            })
                .then((products) => {
                    res.render('order', { order: order, products: products, role: req.session.role });
                })
        })
        .catch((error) => console.log(error.message));
});

//METHODS TO UPDATE ORDER STATUS
app.post('/orders/:id/cancel', (req, res) => {
    updateOrder(req.params.id, { state: 'canceled' }, res);
});

app.post('/orders/:id/shipped', (req, res) => {
    updateOrder(req.params.id, { state: 'shipped' }, res);
});

function updateOrder(id, updates, res) {
    Order.findByIdAndUpdate(id, updates, { new: true })
        .then((order) => {
            if (!order) {
                res.send('This order does not exist');
            }
            res.redirect(`/orders/${id}`);
        })
        .catch((error) => res.send(error));
}

//ROUTE TO VENDOR VIEW PRODUCT PAGE
app.get("/vendorProductView", (req, res) => {
    Product.find()
        .then((products) => {
            //RMIT vendor product 
            User.findById(req.session.userId)
                .then((user) => {
                    const matchedProducts = products.filter(product => product.businessName === user.businessName);
                    res.render("vendorProductView", { user: user, prod: matchedProducts, role: req.session.role });
                })
                .catch((error) => console.log(error.message));;
        })
        .catch((error) => console.log(error.message));
});

//METHOD TO DELETE A PRODUCT
app.get('/:id/delete', (req, res) => {
    Product.findByIdAndDelete(req.params.id)
        .then((product) => {
            if (!product) {
                return res.send();
            }
            res.redirect("/vendorProductView");
        })
        .catch((error) => res.send(error));
});

//ROUTE TO VENDOR ADD PRODUCT PAGE
app.get("/vendorAddProduct", (req, res) => {
    res.render('vendorAddProduct', {role: req.session.role});
});

app.post("/vendorAddProduct", (req, res) => {
    User.findById(req.session.userId)
        .then((user) => {
            req.body.businessName = user.businessName;
            const product = new Product(req.body);

            product.save()
                .then(() => {
                    res.redirect("/vendorProductView");
                })
                .catch((error) => res.send(error));
        });
});

app.post('/register', (req, res) => {
    // Log the form data received from the client
    console.log("Data received from the frontend for POST form:");
    console.log(req.body);
    res.render('registrationSuccesfull', { name: `${req.body.name}` });
});

//METHOD TO LOG OUT
app.get('/logout', (req, res) => {
    delete req.session.userId
    res.redirect('/login');
})


//ROUTE TO STATIC PAGES
app.get('/about', (req, res) => {
    res.render('about.ejs', {role: req.session.role} );
})

app.get('/privacy', (req, res) => {
    res.render('privacy.ejs', {role: req.session.role});
})

//The 404 Route when user enter a route that is not available
app.get('*', function(req, res){
    res.status(404).send('<center><h1>404 NOT FOUND</h1></center>');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});