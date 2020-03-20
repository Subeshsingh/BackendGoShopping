const Pool= require('pg').Pool;
const formidable = require('formidable');
const bcrypt = require('bcrypt');
const jwt= require('jsonwebtoken');
require('dotenv').config();
// const mv = require('mv')
const pool= new Pool({
    user: process.env.USER_NAME,
    host: process.env.HOST_NAME,
    database:process.env.DB_NAME,
    password:process.env.DB_PASSWORD,
    port: process.env.PORT_NUMBER,
});

const userLogin = ( request , response ) => {

    const form =formidable({multiples: true});
    form.parse(request,(err,fields,files)=>{
        if(err){
            throw err   
        }
       //console.log(fields.password);
        const{ email, password } = fields;
        //console.log(email);
        pool.query('Select * from users Where usersid = $1',[email],(error,results)=>{
            if(error){
                throw err
            }
            // console.log(results.rows.length);

            if(results.rows.length === 0){
                return response.status(401).send({
                    error: 'Email_Not_found'
                });
            }else{ 
                // console.log(results.rows[0]);
                // console.log(results.rows[0].id);
                // console.log(results.rows[0].usersid);
                 bcrypt.compare(password,results.rows[0].password,(err,res) =>{
                    if(err){
                        throw err
                    }
                    if(res){
                       
                        const token=jwt.sign(
                            {
                                userId: results.rows[0].id,
                                email: results.rows[0].usersid,
                             },
                             process.env.SECRET_KEY,
                             {
                                 expiresIn:'1h'
                             }
                        );
                        return response.status(200).send({
                            message: 'Auth SuccessFull',
                            email: results.rows[0].usersid,
                            token: token,
                            expiresIn: 3600
                        });
                    }
                    else{
                        return response.status(401).send({
                            error: 'Bad credentials'
                        })
                    }
                });
             }
        })
    });
}


const userSignup = ( request,response ) => {

    const form =formidable({multiples: true});
    
    form.parse(request,(err,fields,files)=>{
        if(err){
            throw err; 
        }
        let{ email, password } = fields;
       
        pool.query('Select * from users  Where usersId=$1',[email],(error,results)=>{
            // console.log(results.rows.length);
            if(error){
                throw err;
            }else if(results.rows.length !==0){
                return response.status(401).send({
                    error: 'Email_already Exits,try to Login'
                });
            }else{
                bcrypt.hash(password, 10, function(err, hash) {
                    // Store hash in your password DB.
                    if(err){
                        throw err;
                       
                    }else{
                        password= hash;
                        pool.query('Insert into users(usersId,password) values($1,$2)',[email,password],(error,results)=>{
                            if(error){
                                throw error
                            }
                            else{
                                console.log(process.env.USER + 'process.env.DATABASE' + process.env.PASSWORD + process.env.PORT + process.env.HOST + "I am env variable")
                                console.log(process.env.SECRET_KEY);
                                const token=jwt.sign(
                                    {
                                        email: email,
                                     },
                                     process.env.SECRET_KEY,
                                     {
                                         expiresIn:'1h'
                                     }
                                );
                                return response.status(201).send({
                                    message: 'Signedup Successfully',
                                    email: email,
                                    token: token,
                                    expiresIn: 3600
                                });
                            }
                        });
                    }
                });
            }
        })
    });
}

module.exports = {
    userLogin,
    userSignup
};
