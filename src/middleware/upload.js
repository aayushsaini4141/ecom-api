const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecom-api-images',
    // allowed_formats removed to allow all image types
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
