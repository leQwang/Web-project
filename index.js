// static data for testing
const orders = require('./orders');
const products = require('./products.js');
const users = require('./users.js');

const express = require("express");
const session = require('express-session');
const app = express();
const port = 4200;

const User = require('./model/User');
const Order = require('./model/Order');
const Product = require('./model/Product');
const Hub = require('./model/DistributionHub');
const DistributionHub = require('./model/DistributionHub');
const user = require('./users.js');
const { error } = require('console');
const {hashPassword, decryptHashedPassword} = require('./public/js/hashing');

app.set('view engine', 'ejs');
app.use(express.static("public"));

// Use the `express.urlencoded` middleware to parse incoming form data
app.use(express.urlencoded({ extended: true }));
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

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
      next();
    } else {
      res.redirect('/login');
    }
  };


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
})

app.post("/login-processing", async (req, res) => {
    const username = req.body.username;
    const passwordPlain = req.body.password;
    
    try {
        const user = await User.findOne({ username: username })
        console.log(user);
        if (!user) {
          return res.status(400).send('Invalid credentials (Username)');
        }

       const isMatch = await decryptHashedPassword(passwordPlain, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid credentials (Password)');
          }
    
        // Passwords match, so create a session and redirect to product page
        req.session.userId = user._id;
        res.redirect('/products');
      } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
      }
})

app.post("/registerCustomer", async (req, res) => {
    req.body.role = 'Customer';
    const data = req.body;
    const password = req.body.password;
    const hashedPassword = await hashPassword(password);
    console.log(hashedPassword);
    const user = new User({ username: data.username, password: hashedPassword, profilePic: data['profile-picture'], customerName: data['name'], customerAddress: data['address'], role: data.role });

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
    res.render('myAccount', { user: users[0] });
    //TODO get the seesion user
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
    Hub.find()
    .then((hubs) => {
        res.render('registerShipper', {hubs: hubs})
    })
    .catch((error) => console.log(error))
});

app.get("/registerVendor", (req, res) => {
    res.render('registerVendor', {});
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
