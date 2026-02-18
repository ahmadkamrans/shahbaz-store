import Category from '../models/Category.js';
import { AppError } from '../utils/errors.js';
import { isValidObjectId } from '../utils/helpers.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 });

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      $or: [
        { _id: req.params.id },
        { slug: req.params.id }
      ],
      isActive: true
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('Category with this name already exists', 400));
    }
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      throw new AppError('Invalid category ID format', 400);
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    Object.assign(category, req.body);
    await category.save();

    res.json({
      success: true,
      category
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('Category with this name already exists', 400));
    }
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      throw new AppError('Invalid category ID format', 400);
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
