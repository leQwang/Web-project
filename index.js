const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Use the `express.urlencoded` middleware to parse incoming form data
app.use(express.urlencoded({ extended: true }));

//TODO static data for testing
let orders = require('./orders');
console.log(orders);

app.get('/shipper', (req, res) => {
  res.render('shipper', { orders: orders });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});