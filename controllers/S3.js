const AWS = require("aws-sdk");

function UploadToS3(data, file) {
  try {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const AWS_KEY_ID = process.env.AWS_KEY_ID;
    const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;

    let s3bucket = new AWS.S3({
      accessKeyId: AWS_KEY_ID,
      secretAccessKey: AWS_SECRET_KEY,
    });

    var params = {
      Bucket: BUCKET_NAME,
      Key: file,
      Body: data,
      ACL: "public-read",
    };
    // console.log("params", params);
    return new Promise((resolve, reject) => {
      s3bucket.upload(params, (err, data) => {
        if (err) {
          console.log("Something went wrong", err);
          reject(err);
        } else {
          // console.log("success", data);
          resolve(data.Location);
        }
      });
    });
  } catch (err) {
    res.status(500).json({
      error: err,
      fileUrl: "",
    });
  }
}

module.exports = UploadToS3;
