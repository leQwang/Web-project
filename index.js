const products = require('./products.js');


const express = require("express");
const app = express();
const port = 4200;

app.set('view engine', 'ejs');
app.use(express.static("Public"));

app.get("/productPage", (req, res) => {
    res.render('productPage', {products: products});
});


app.get("/product/:id", (req, res) => {
    const {id} = req.params;
    const product = products.find((p)=> p.id == id);
    res.render('productDetail', {product});
});

app.listen(port, () => {
    console.log(`Listining on port ${port}`);
});
