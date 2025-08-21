
/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Image upload
 */
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

/**
 * @swagger
 * /upload-image:
 *   post:
 *     summary: Upload an image
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded
 *       400:
 *         description: No image uploaded
 */
router.post('/upload-image', upload.single('image'), (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: 'No image uploaded' });
	}
	res.json({
		url: req.file.path,
		public_id: req.file.filename,
	});
});

module.exports = router;
