import Analytics from '../models/Analytics.js';
import Product from '../models/Product.js';
import { AppError } from '../utils/errors.js';
import { isValidObjectId, safeNumber } from '../utils/helpers.js';
import { validateQueryParams } from '../utils/validators.js';

export const trackEvent = async (req, res, next) => {
  try {
    const { eventType, productId, categoryId, metadata } = req.body;

    if (!eventType) {
      throw new AppError('Event type is required', 400);
    }

    // Validate eventType
    const validEventTypes = ['page_view', 'product_view', 'add_to_cart', 'purchase', 'search'];
    if (!validEventTypes.includes(eventType)) {
      throw new AppError(`Invalid event type. Must be one of: ${validEventTypes.join(', ')}`, 400);
    }

    // Validate productId if provided
    if (productId && !isValidObjectId(productId)) {
      throw new AppError('Invalid product ID format', 400);
    }

    // Validate categoryId if provided
    if (categoryId && !isValidObjectId(categoryId)) {
      throw new AppError('Invalid category ID format', 400);
    }

    const analytics = await Analytics.create({
      eventType,
      product: productId || null,
      category: categoryId || null,
      user: req.user?._id || null,
      metadata: metadata || null,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      success: true,
      analytics
    });
  } catch (error) {
    next(error);
  }
};

export const getPopularProducts = async (req, res, next) => {
  try {
    const validatedDays = validateQueryParams.days(req.query.days, 30, 365);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - validatedDays);

    const popularProducts = await Analytics.aggregate([
      {
        $match: {
          eventType: 'product_view',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$product',
          viewCount: { $sum: 1 }
        }
      },
      {
        $sort: { viewCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          _id: '$product._id',
          name: '$product.name',
          slug: '$product.slug',
          price: '$product.price',
          images: '$product.images',
          averageRating: '$product.averageRating',
          viewCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      products: popularProducts
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const validatedDays = validateQueryParams.days(req.query.days, 30, 365);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - validatedDays);

    const [
      totalViews,
      productViews,
      searchQueries,
      topProducts
    ] = await Promise.all([
      Analytics.countDocuments({ 
        eventType: 'page_view', 
        createdAt: { $gte: startDate } 
      }),
      Analytics.countDocuments({ 
        eventType: 'product_view', 
        createdAt: { $gte: startDate } 
      }),
      Analytics.distinct('metadata.query', {
        eventType: 'search',
        createdAt: { $gte: startDate }
      }),
      Analytics.aggregate([
        {
          $match: {
            eventType: 'product_view',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$product',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $project: {
            name: '$product.name',
            views: '$count'
          }
        }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalViews,
        productViews,
        searchQueries: searchQueries.slice(0, 10),
        topProducts
      }
    });
  } catch (error) {
    next(error);
  }
};
