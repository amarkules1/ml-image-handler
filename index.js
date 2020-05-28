const express = require('express');
const Multer = require('multer');
const {Storage} = require('@google-cloud/storage');
const dotenv = require('dotenv');
dotenv.config();
const gcsHelper = require('helpers/gcsHelper');


const DEFAULT_BUCKET_NAME = process.env.DEFAULT_BUCKET_NAME;
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID; 
const GOOGLE_CLOUD_KEYFILE = process.env.GOOGLE_CLOUD_KEYFILE; 

const storage = new Storage({
  projectId: GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: GOOGLE_CLOUD_KEYFILE,
});

const multer = Multer({
    storage: Multer.MemoryStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // Maximum file size is 10MB
    },
});

var app = express();
app.set('port', (process.env.PORT || 3000));

app.use('/image', multer.single('file'), function (req, res, next) {
  if (!req.file) {
    return next();
  }
    
  return gcsHelper.addFileToBucket(req.file);
});

app.use('/*', function(req, res){
    res.send("Hello World");
})

app.listen(app.get('port'), function () { return console.log("Application listening on port " + app.get('port')); });