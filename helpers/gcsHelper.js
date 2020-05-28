const {Storage} = require('@google-cloud/storage');

// doc for bucket api: https://googleapis.dev/nodejs/storage/latest/Bucket.html#create

const DEFAULT_BUCKET_NAME = process.env.DEFAULT_BUCKET_NAME;
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID; 
const GOOGLE_CLOUD_KEYFILE = process.env.GOOGLE_CLOUD_KEYFILE; 

const storage = new Storage({
  projectId: GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: GOOGLE_CLOUD_KEYFILE,
});

// adds file to GCS bucket with bucketName 
// if no bucket name is provided, the default bucket is used
exports.addFileToBucket = (file, bucketName) => {
    bucketName = bucketName || DEFAULT_BUCKET_NAME;
    const bucket = storage.bucket(bucketName);
    const gcsFileName = `${Date.now()}-${file.originalname}`;
    const gcsFile = bucket.file(gcsFileName);
  
    const stream = gcsFile.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });
  
    stream.on('error', (err) => {
      file.cloudStorageError = err;
      next(err);
    });
  
    stream.on('finish', () => {
      file.cloudStorageObject = gcsFileName;
  
      return gcsFile.makePublic()
        .then(() => {
          next();
        });
    });
  
    stream.end(file.buffer);
}

//creates GCS bucket with name bucketName (parameter format: "gs://<UNIQUE_BUCKET_NAME>")
exports.createBucket = (bucketName) => {
    const bucket = storage.bucket(bucketName);
    bucket.create();
}

// returns an array of names of all buckets in the project
exports.getBuckets = () =>{
    const [buckets] = await storage.getBuckets();
    return buckets;
}