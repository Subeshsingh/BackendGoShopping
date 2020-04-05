const path = require('path')
const fs = require('fs');
const AWS = require('aws-sdk');
const db = require('./queries');
const formidable = require('formidable');

const submit = async (request, response) => {

    try {
        const credentials = new AWS.SharedIniFileCredentials({profile: 'iamratneshdev'});
        AWS.config.credentials = credentials
        AWS.config.update({ region: 'ap-south-1' })
        const s3 = new AWS.S3({ apiVersion: '2012-10-17' })

        const { fields, files } = await parse_request(request)
        const file = files.document

        const uploadParams = { Bucket: 'hirehelloworld.in/documents', Key: '', Body: '' }
        const fileStream = fs.createReadStream(file.path)
        fileStream.on('error', function(err) {
            console.log('parse Error', err)
            throw err
        })
        file_name = new Date().getTime() + '_' + file.name
        uploadParams.Body = fileStream;
        uploadParams.Key = path.basename(file_name);

        data = await upload_object_to_s3(uploadParams, s3)
        fields.document = data.Location
        
        await delete_temp_file(file.path)

        await insert_data(fields)
        response.status(201).send('Form submitted successfully.');
    } 
    catch (err) {
        console.log("Error", err);
        response.status(500).send('Something went worng.');
    }
}

function upload_object_to_s3(uploadParams, bucket_obj) {
    return new Promise((resolve, reject) => {
        bucket_obj.upload (uploadParams, function (err, data) {
            if (err) {
                console.log("Error", err);
                reject(err)
            }
            resolve(data)
        })
    })
}

function insert_data(data) {
    return new Promise((resolve, reject) => {
        db.pool.query('Insert into application_forms (name, email, message, document) values($1,$2,$3,$4)',[data.name, data.email, data.message, data.document],(err, results) => {
            if(err){
                console.log("Error", err);
                reject(err)
            }
            resolve(true)
        });  
    })
}

function parse_request(request) {
    return new Promise((resolve, reject) => {
        const form = formidable({ multiples: true });
        form.parse(request, (err, fields, files) => {
            if (err) {
                console.log('parse Error', err);
                reject(err)
            }
            resolve({fields: fields, files: files})
        })
    })
}

function delete_temp_file(file_path) {
    return new Promise((resolve, reject) => {
        fs.unlink(file_path, function (err) {
            if (err) reject(err);
            resolve(true)
        });
    })
}

module.exports = {submit}