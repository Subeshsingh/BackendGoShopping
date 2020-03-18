const express = require('express');
const app = express();
const port = 8000;
const bodyParser = require('body-parser');
const db = require('./queries');
const auth = require('./authQueries');
const data = require('./album.json');
const cors= require('cors');
const fileupload =require('express-fileupload');


app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000']
  }));
// app.use(bodyParser.json());
// app.use(
//     bodyParser.urlencoded({
//         extended: true,
//     }),
//     fileupload()
// );

app.get('/',(request,response) =>{
    response.json({info:'Node.js,Express, and Postgres API'});
});


app.get('/products',db.getProducts);
app.get('/uploads/:filename',db.getImages);
app.get('/products/:id',db.getProductById);
app.post('/products',db.createProduct);
app.put('products/:id',db.updateProduct);
app.delete('/products/:id',db.deleteProduct);
app.post('/login',auth.userLogin);
app.post('/signup',auth.userSignup);

////Password reset 

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
