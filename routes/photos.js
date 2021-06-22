const AWS = require("aws-sdk");
const multer = require("multer");

const storage = multer.memoryStorage(); // save file to memory
const multerUploads = multer({ storage }).fields([
  { name: "image" },
  { name: "listingData" },
]);

/* Default Image Upload Function */
const uploadImagesToAWS = async (images, type = "listing") => {
  if (!images) return;
  const BucketName = "vhomes-images-bucket";
  const BucketFolder =
    process.env.NODE_ENV === "production" ? "/production" : "/development";
  const BucketType = type === "profileImg" ? "/profile" : "";
  let s3bucket = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Bucket: BucketName,
  });

  let imgArr =
    typeof images[Symbol.iterator] === "function" ? [...images] : [images];
  let params = [];

  imgArr.forEach((image) => {
    params.push({
      Bucket: BucketName + BucketFolder + BucketType,
      Key: image.originalname,
      Body: image.buffer,
      ACL: "public-read",
      Expires: 60,
    });
  });

  const imageUploadRes = await Promise.all(
    params.map((param) => {
      return new Promise((res, rej) => {
        s3bucket.upload(param, (err, data) => {
          if (err) {
            console.error(error);
            let failedUpload = new Error("Failed to upload image to server.");
            failedUpload.status = 500;
            rej(failedUpload);
          } else {
            res(data.Location);
          }
        });
      });
    })
  );

  return imageUploadRes;
};

module.exports = {
  multerUploads,
  uploadImagesToAWS,
};
