const express = require('express');
const Multer = require('multer');
const {Storage} = require('@google-cloud/storage');
const dotenv = require('dotenv');

dotenv.config();
const DEFAULT_BUCKET_NAME = process.env.DEFAULT_BUCKET_NAME;
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID; 
const GOOGLE_CLOUD_KEYFILE = process.env.GOOGLE_CLOUD_KEYFILE; 
console.log(GOOGLE_CLOUD_KEYFILE)
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
    
      const bucketName = req.body.bucketName || DEFAULT_BUCKET_NAME;
      console.log(bucketName);
      const bucket = storage.bucket(bucketName);
      const gcsFileName = `${Date.now()}-${req.file.originalname}`;
      const file = bucket.file(gcsFileName);
    
      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });
    
      stream.on('error', (err) => {
        req.file.cloudStorageError = err;
        next(err);
      });
    
      stream.on('finish', () => {
        req.file.cloudStorageObject = gcsFileName;
    
        return file.makePublic()
          .then(() => {
            next();
          });
      });
    
      stream.end(req.file.buffer);
});

app.use('/*', function(req, res){
    res.send("Hello World");
})

app.listen(app.get('port'), function () { return console.log("Application listening on port " + app.get('port')); });