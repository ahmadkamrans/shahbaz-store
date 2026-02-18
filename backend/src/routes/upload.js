import express from 'express';
import upload from '../config/multer.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../utils/errors.js';

const router = express.Router();

router.post('/product-image', authenticate, authorize('admin'), (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return next(err);
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      image: `/uploads/products/${req.file.filename}`
    });
  });
});

export default router;
