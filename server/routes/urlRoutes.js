const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createShortUrl,
  getAllUrls,
  getAnalytics,
  deleteUrl,
  toggleUrlStatus,
} = require('../controllers/urlController');
const { createUrlLimiter } = require('../middleware/rateLimiter');

// Validation rules
const createUrlValidation = [
  body('url')
    .trim()
    .notEmpty().withMessage('URL is required')
    .isLength({ max: 2048 }).withMessage('URL is too long (max 2048 chars)'),
  body('customAlias')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Custom alias must be 3–30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Alias can only contain letters, numbers, hyphens, or underscores'),
  body('expiresAt')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Invalid date format for expiration'),
];

// GET /api/urls/analytics — must be before /:id to avoid route conflicts
router.get('/analytics', getAnalytics);

// GET /api/urls
router.get('/', getAllUrls);

// POST /api/urls
router.post('/', createUrlLimiter, createUrlValidation, createShortUrl);

// DELETE /api/urls/:id
router.delete('/:id', deleteUrl);

// PATCH /api/urls/:id/toggle
router.patch('/:id/toggle', toggleUrlStatus);

module.exports = router;
