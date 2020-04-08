const express = require('express');
const app = express();
const port = 8000;
const bodyParser = require('body-parser');
const db = require('./queries');
const auth = require('./authQueries');
const data = require('./album.json');
const cors= require('cors');
const fileupload =require('express-fileupload');
const respass = require('./passreset');
const path =require('path')
const hirehelloworld = require('./hirehelloworld')
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000','http://localhost:8000/views/']
}));



app.get('/',(request,response) =>{
    response.json({info:'Node.js,Express, and Postgres API'});
});

app.get('/products', db.getProducts);
app.get('/uploads/:filename', db.getImages);
app.get('/products/:id', db.getProductById);
app.post('/products',db.createProduct);
app.put('products/:id',db.updateProduct);
app.delete('/products/:id',db.deleteProduct);
app.post('/login',auth.userLogin);
app.post('/signup',auth.userSignup);

////Password reset 
app.post('/reset_pw/user',respass.resetPassword);
app.get('/reset_pw/:user/:token',respass.verifyUserResetPassLink);
app.post('/reset_password/:user',respass.formSubmitHandle);

app.post('/submit', hirehelloworld.submit);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
