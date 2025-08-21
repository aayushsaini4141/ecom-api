// const express = require('express');
// const router = express.Router();
// const upload = require('../middleware/upload');

// // POST /upload-image
// router.post('/upload-image', upload.single('image'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No image uploaded' });
//   }
//   res.json({
//     url: req.file.path,
//     public_id: req.file.filename,
//   });
// });

// module.exports = router;
