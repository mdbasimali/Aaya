import { Router } from 'express';
import {
  getGalleryItems,
  getGalleryItemById,
} from '../controllers/galleryController.js';

const router = Router();

// GET /api/gallery
router.get('/', getGalleryItems);

// GET /api/gallery/:id
router.get('/:id', getGalleryItemById);

export default router;
