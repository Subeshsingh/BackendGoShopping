const Pool= require('pg').Pool;
const formidable = require('formidable');
const bcrypt = require('bcrypt');
const jwt= require('jsonwebtoken');
const mf= require('./email');
const path= require('path');
require('dotenv').config();
const pool= new Pool({
    user: process.env.USER_NAME,
    host: process.env.HOST_NAME,
    database:process.env.DB_NAME,
    password:process.env.DB_PASSWORD,
    port: process.env.PORT_NUMBER,

});
const usePasswordHashToMakeToken = ( userId,passwordHash, createdAt) => {
    // highlight-start
    const secret = passwordHash + "-" + createdAt
    console.log(secret);
    const token = jwt.sign({ userId }, secret, {
        issuer:'goshopping.pagal247@gmail.com',
        expiresIn: 3600 // 1 hour
    })
    // highlight-end
    return token
  };

const verifyToken =(token, secret)=>{
    jwt.verify(token, secret, (err,decoded)=>{
        if(err){
            return false;
        }
        if(decoded.expiresIn <= Date.now()){
            return false;
        }  
      });
    return true; 
}
const resetPassword =( request,response)=> {
    const form =formidable({multiples: true});
    form.parse( request, (error,fields,files) =>{
        if(error){
            throw error;
        }
        const {email} = fields;
        pool.query('Select * from users Where usersid = $1',[email],(err,results)=>{
            if(err){
                throw err;
            }
            console.log(results.rows);
            if(results.rows.length >0){
                    const { id,password,createdat} = results.rows[0];
                  //  console.log(id,password, createdat);                    
                    const token = usePasswordHashToMakeToken(id,password,createdat);
                    const url = mf.getPasswordResetURL(id,token)
                    //console.log(url);
                    const emailTemplate = mf.resetPasswordTemplate(email, url);

                    // sending mail///
                    console.log('Sending mail');
                    const sendEmail = () => {
                        mf.transporter.sendMail(emailTemplate, (err, info) => {
                          if (err) {
                              return response.status(500).json("Error sending email")
                          }
                         console.log(`** Email sent **`, info.response);
                        });
                      }
                    sendEmail();
                    return response.status(200).json({
                        message: 'Email send to your email address'
                    });
                
            }else{
                return response.status(401).json({
                    erorr: 'No account matched to this Email'
                });
            }
        });
    });
    
}

const verifyUserResetPassLink =(request,response) => {
    const id=(request.params.user)
    //  console.log(id);
    const token=(request.params.token)
    //console.log(token);
    pool.query('Select * from users where id=$1',[id],(err,results)=>{
        if(err){
            throw err
        }
        if(results.rows.length >0){ 
            const secret = results.rows[0].password + "-" + results.rows[0].createdat;
          //  console.log(secret);
            jwt.verify(token, secret, function(err, decoded) {
                if(err){
                    return response.status(501).json({
                        error: 'Link Expired please go to site to resend link'
                    })
                }
                console.log(decoded);
                if(decoded.userId ==id && decoded.iss ==='goshopping.pagal247@gmail.com'){
                    console.log("I am in");
                    response.render('pages/form',{ id:id, token:token });
                 }   
              }); 

        }else{
            return response.status(401).json({
                error: 'Could not found account'
            })
        }
    })
}

const formSubmitHandle = (request,response) =>{
   // console.log(request.headers);
    const form = formidable({ multiples: true });
  //  console.log("formSubmit");
  //  console.log(request.params);
    form.parse( request, (error,fields,files)=> {
        if(error){
            return response.status(401).json({
                error:'Something went wrong'
            })    
        }
        let {userId,token,password, cnfpassword} =fields;
        console.log(token);
        pool.query('Select * from users Where id=$1',[userId], (err,results) =>{
            if(err){
                throw err
            }
           
            if(results.rows.length > 0){ 
                console.log(results.rows[0] + 'Hello i am results of query for user lookup');
                const secret = results.rows[0].password + "-" + results.rows[0].createdat;
                console.log( 'secret=> '+secret);
                if(verifyToken(token,secret)){
                    console.log("token verified");
                    bcrypt.hash(password,10,(err,hash) =>{
                        if(err){
                            throw err
                        }else{
                            console.log("Hash generted")
                            password=hash;
                            pool.query('Update users SET password=$1 Where id=$2',[password,userId],(error,results)=>{
                                if(error){
                                    throw error
                                }else{
                                    console.log("uapdted successfully");
                                    response.render('pages/confirmation',{message:"Password has been changed successfuly"});
                                }
                            });     
                        }
                    })
                }

            }else{
                return response.render('pages/confirmation',{message:"Couldn't reset the password due to in valid credenatils"});
            }
        })
    })
}

module.exports ={
    resetPassword,
    verifyUserResetPassLink,
    verifyToken,
    formSubmitHandle
}


