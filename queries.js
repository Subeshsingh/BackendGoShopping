const Pool= require('pg').Pool;
const formidable = require('formidable');
const mv = require('mv')
require('dotenv').config();
const cache = require('./middleware/cache');
const pool = new Pool({
    host: process.env.HOST_NAME || 'localhost',
    user: process.env.USER_NAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    port: process.env.PORT_NUMBER || 5432,
});

const getProducts=(request,response) =>{
    // console.log(request.header('key'));
     const data=cache.get(request);
     if(data){
         console.log('cached data');
        response.status(200).json(data);
     }else{
        pool.query('Select * From Products Order By id ASC',(error,results)=>{
                // console.log(results)
                if(error){
                    throw error;
                }
                cache.set(request,results.rows);
                console.log('Fetched data');
                response.status(200).json(results.rows)
            });
    }   
}

const getProductById =(request,response) =>{
    const id =parseInt(request.params.id);
    pool.query('Select * From Products Where id=$1',[id],(error,results)=>{
        if(error){
            throw error;
        }
        response.status(200).json(results.rows)
    });
};

const createProduct = (request,response) => {
 
    const form = formidable({ multiples: true });
    form.parse(request, (err, fields, files) => {
        if (err) {
            // next(err);
            throw err
            return
        }

        console.log(files, fields);
        // response.status(201).send(`Product added with Id`);
        
        const file = files.productimgurl;
        const path = './uploads/'+ file.name;
        mv(file.path, path, function(error,result){
            if(error){
                throw error;
            }
        })
        
        productimgurl=path;
        const {productname, producttype,productdesc,productprice} = fields
        pool.query('Insert into Products ( productname, producttype,productdesc,productprice,productimgUrl) values($1,$2,$3,$4,$5)',[productname, producttype,productdesc,productprice,productimgurl],(error,results) =>{
            if(error){
                throw error;
            }
            response.status(201).send(`Product added with Id :${results.insertId}`);
        });
    });
}

const updateProduct = (request,response) =>{
    const id =parseInt(request.params.id);
    const { productName, productType,productdesc,productPrice,productImgUrl} =request.body;
    pool.query(
        'Update Products Set productName= $1,productType =$2 ,productdesc =$3,productPrice =$4,productImgUrl =$5',[productName, productType,productdesc,productPrice,productImgUrl],
        (error,results) =>{
            if(error){
                throw error;
            }
            response.status(200).send(`Product modified  with ID : ${id}`);
        }
    );
};


const deleteProduct = (request , response) =>{
    const id = parseInt(request.params.id);
    console.log("i am deleting the post number:"+ id);
    pool.query(
        'Delete From Products Where id = $1',[id],(error,results) =>{
            if(error){
                throw error;
            }
            response.status(200).send(`Product deleted with Id: ${id}`);
        }
    );
};


const authorize=(req, res, next) => {
            console.log("hello i am authorizing")
            if ( req.header('key')!=='asdf123') {
                // user is not authorized by checking header key value pair
                return res.status(401).json({ message: 'Unauthorized' });
            }
            // authentication and authorization successful
            next();
        }
const getImages=(req,res) =>{
    let filename = req.params.filename;
    console.log("Fwdf")
    let path= __dirname +'/uploads/' + filename;
    res.sendFile(path);
}

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    authorize,
    getImages,
    pool
   // cache
};
