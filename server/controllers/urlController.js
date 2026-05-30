const { validationResult } = require('express-validator');
const Url = require('../models/Url');
const { generateUniqueId, validateAlias } = require('../utils/nanoidHelper');
const { isValidUrl } = require('../utils/urlValidator');
const { AppError } = require('../middleware/errorHandler');

/**
 * POST /api/urls
 * Create a shortened URL
 */
const createShortUrl = async (req, res, next) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { url, customAlias, expiresAt } = req.body;

    // Validate URL format
    const { valid, reason } = isValidUrl(url);
    if (!valid) {
      return res.status(400).json({ success: false, error: reason });
    }

    let shortUrlId;

    // Handle custom alias
    if (customAlias && customAlias.trim()) {
      const aliasCheck = await validateAlias(customAlias.trim());
      if (!aliasCheck.valid) {
        return res.status(409).json({ success: false, error: aliasCheck.reason });
      }
      shortUrlId = customAlias.trim();
    } else {
      // Generate collision-free ID
      shortUrlId = await generateUniqueId();
    }

    // Parse expiration date
    let expiry = null;
    if (expiresAt) {
      expiry = new Date(expiresAt);
      if (isNaN(expiry.getTime()) || expiry <= new Date()) {
        return res.status(400).json({ success: false, error: 'Expiration date must be in the future' });
      }
    }

    const newUrl = await Url.create({
      shortUrlId,
      customAlias: customAlias ? customAlias.trim() : null,
      originalUrl: url,
      expiresAt: expiry,
    });

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    res.status(201).json({
      success: true,
      data: {
        _id: newUrl._id,
        shortUrl: `${baseUrl}/${shortUrlId}`,
        shortUrlId: newUrl.shortUrlId,
        originalUrl: newUrl.originalUrl,
        customAlias: newUrl.customAlias,
        clicks: newUrl.clicks,
        createdAt: newUrl.createdAt,
        expiresAt: newUrl.expiresAt,
        isActive: newUrl.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /:shortUrlId
 * Redirect to original URL + track click
 */
const redirectToUrl = async (req, res, next) => {
  try {
    const { shortUrlId } = req.params;

    const urlDoc = await Url.findOne({ shortUrlId });

    if (!urlDoc) {
      return res.status(404).json({ success: false, error: 'Short URL not found' });
    }

    if (!urlDoc.isActive) {
      return res.status(410).json({ success: false, error: 'This URL has been deactivated' });
    }

    if (urlDoc.expiresAt && new Date() > urlDoc.expiresAt) {
      return res.status(410).json({ success: false, error: 'This short URL has expired' });
    }

    // Increment click count and update lastAccessed atomically
    await Url.findByIdAndUpdate(urlDoc._id, {
      $inc: { clicks: 1 },
      lastAccessed: new Date(),
    });

    return res.redirect(301, urlDoc.originalUrl);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/urls
 * Get all URLs with search, pagination, sorting
 */
const getAllUrls = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build search filter
    const filter = {};
    if (search.trim()) {
      filter.$or = [
        { originalUrl: { $regex: search.trim(), $options: 'i' } },
        { shortUrlId: { $regex: search.trim(), $options: 'i' } },
        { customAlias: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Allowed sort fields
    const allowedSortFields = ['createdAt', 'clicks', 'lastAccessed', 'originalUrl', 'shortUrlId'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    const [urls, total] = await Promise.all([
      Url.find(filter)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Url.countDocuments(filter),
    ]);

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    const enriched = urls.map((u) => ({
      ...u,
      shortUrl: `${baseUrl}/${u.shortUrlId}`,
      isExpired: u.expiresAt ? new Date() > new Date(u.expiresAt) : false,
    }));

    res.json({
      success: true,
      data: enriched,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/urls/analytics
 * Get dashboard analytics
 */
const getAnalytics = async (req, res, next) => {
  try {
    const [totalUrls, totalClicksAgg, topUrls, recentUrls] = await Promise.all([
      Url.countDocuments(),

      Url.aggregate([
        { $group: { _id: null, total: { $sum: '$clicks' } } },
      ]),

      Url.find({ isActive: true })
        .sort({ clicks: -1 })
        .limit(5)
        .lean(),

      Url.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const totalClicks = totalClicksAgg[0]?.total || 0;
    const avgClicks = totalUrls > 0 ? (totalClicks / totalUrls).toFixed(2) : 0;
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    res.json({
      success: true,
      data: {
        totalUrls,
        totalClicks,
        avgClicks: parseFloat(avgClicks),
        topUrls: topUrls.map((u) => ({ ...u, shortUrl: `${baseUrl}/${u.shortUrlId}` })),
        recentUrls: recentUrls.map((u) => ({ ...u, shortUrl: `${baseUrl}/${u.shortUrlId}` })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/urls/:id
 * Delete a URL by MongoDB _id
 */
const deleteUrl = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Url.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'URL not found' });
    }

    res.json({ success: true, message: 'URL deleted successfully', data: { _id: id } });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/urls/:id/toggle
 * Toggle isActive status
 */
const toggleUrlStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const urlDoc = await Url.findById(id);
    if (!urlDoc) {
      return res.status(404).json({ success: false, error: 'URL not found' });
    }

    urlDoc.isActive = !urlDoc.isActive;
    await urlDoc.save();

    res.json({
      success: true,
      message: `URL ${urlDoc.isActive ? 'activated' : 'deactivated'}`,
      data: { _id: id, isActive: urlDoc.isActive },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShortUrl,
  redirectToUrl,
  getAllUrls,
  getAnalytics,
  deleteUrl,
  toggleUrlStatus,
};
