const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    shortUrlId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    customAlias: {
      type: String,
      default: null,
      sparse: true,
      trim: true,
    },
    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAccessed: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// TTL index: auto-delete documents when expiresAt is reached (if set)
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

// Text index for search
urlSchema.index({ originalUrl: 'text', shortUrlId: 'text', customAlias: 'text' });

// Virtual: isExpired
urlSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Method: check if URL is accessible
urlSchema.methods.isAccessible = function () {
  return this.isActive && !this.isExpired;
};

module.exports = mongoose.model('Url', urlSchema);
