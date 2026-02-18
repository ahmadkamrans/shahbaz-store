import Order from '../models/Order.js';
import Product from '../models/Product.js';
import DiscountCode from '../models/DiscountCode.js';
import { AppError } from '../utils/errors.js';
import { sendEmail } from '../config/email.js';
import { orderConfirmationTemplate } from '../utils/emailTemplates.js';
import mongoose from 'mongoose';
import { isValidObjectId } from '../utils/helpers.js';

export const getOrders = async (req, res, next) => {
  try {
    const query = { user: req.user._id };
    
    // Admin can see all orders
    if (req.user.role === 'admin') {
      delete query.user;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name slug images')
      .populate('discountCode', 'code type value')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    // Validate order ID
    if (!isValidObjectId(req.params.id)) {
      throw new AppError('Invalid order ID format', 400);
    }

    const query = { _id: req.params.id };
    
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const order = await Order.findOne(query)
      .populate('items.product', 'name slug images price')
      .populate('discountCode', 'code type value')
      .populate('user', 'name email');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, discountCode, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      throw new AppError('Order must contain at least one item', 400);
    }

    // Validate all product IDs
    for (const item of items) {
      if (!isValidObjectId(item.product)) {
        throw new AppError(`Invalid product ID: ${item.product}`, 400);
      }
    }

    // Check for duplicate products in order items
    const productIds = items.map(item => item.product.toString());
    const uniqueProductIds = new Set(productIds);
    if (productIds.length !== uniqueProductIds.size) {
      throw new AppError('Duplicate products in order items. Please combine quantities for the same product.', 400);
    }

    // Calculate total and validate products with stock checking
    let totalAmount = 0;
    const orderItems = [];
    const productUpdates = [];

    for (const item of items) {
      // Lock product for update to prevent race conditions
      const product = await Product.findById(item.product).session(session);
      if (!product || !product.isActive) {
        throw new AppError(`Product ${item.product} not found or inactive`, 404);
      }

      let itemPrice = product.price;
      let stockToCheck = product.stock;
      let matchedVariants = [];

      // Handle variant if provided
      if (item.selectedVariant && product.variants && product.variants.size > 0) {
        // Match all variant types in the selected variant
        let totalPriceModifier = 0;
        let variantStock = null;
        
        for (const [variantType, variantArray] of product.variants.entries()) {
          const selectedVariantValue = item.selectedVariant[variantType]?.value;
          if (selectedVariantValue) {
            const variant = variantArray.find(v => v.value === selectedVariantValue);
            if (variant) {
              matchedVariants.push({ variantType, variant });
              // Accumulate price modifiers from all variant types
              totalPriceModifier += (variant.priceModifier || 0);
              // Use variant stock if available (prefer variant stock over product stock)
              if (variant.stock !== undefined && variant.stock !== null) {
                variantStock = variant.stock;
              }
            } else {
              throw new AppError(
                `Invalid variant selection: ${variantType} = ${selectedVariantValue} not found for ${product.name}`,
                400
              );
            }
          }
        }
        
        // Apply total price modifier from all variants
        itemPrice = product.price + totalPriceModifier;
        
        // Use variant stock if any variant has stock defined
        if (variantStock !== null) {
          stockToCheck = variantStock;
        }
      }

      // Check stock (product-level or variant-level)
      if (product.trackInventory && stockToCheck < item.quantity) {
        const variantDescription = matchedVariants.length > 0
          ? ` (${matchedVariants.map(v => v.variant.value).join(', ')})`
          : '';
        throw new AppError(
          `Insufficient stock for ${product.name}${variantDescription}`,
          400
        );
      }

      const finalItemPrice = itemPrice * item.quantity;
      totalAmount += finalItemPrice;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: itemPrice, // Store the final price per unit (with variant modifier)
        selectedVariant: item.selectedVariant || null
      });

      // Prepare stock update
      productUpdates.push({
        product,
        quantity: item.quantity,
        matchedVariants
      });
    }

    // Apply discount code if provided
    let discountAmount = 0;
    let discountCodeDoc = null;

    if (discountCode) {
      discountCodeDoc = await DiscountCode.findOne({ 
        code: discountCode.toUpperCase(),
        isActive: true
      }).session(session);

      if (!discountCodeDoc) {
        throw new AppError('Invalid discount code', 400);
      }

      // Check expiry
      if (discountCodeDoc.expiryDate && new Date() > discountCodeDoc.expiryDate) {
        throw new AppError('Discount code has expired', 400);
      }

      // Check max uses
      if (discountCodeDoc.maxUses && discountCodeDoc.usedCount >= discountCodeDoc.maxUses) {
        throw new AppError('Discount code has reached maximum uses', 400);
      }

      // Check min purchase
      if (totalAmount < discountCodeDoc.minPurchase) {
        throw new AppError(`Minimum purchase of $${discountCodeDoc.minPurchase} required`, 400);
      }

      // Calculate discount
      if (discountCodeDoc.type === 'percentage') {
        discountAmount = (totalAmount * discountCodeDoc.value) / 100;
      } else {
        discountAmount = discountCodeDoc.value;
      }
    }

    // Ensure discount doesn't exceed total amount
    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // Create order within transaction
    const createdOrder = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount: finalAmount,
      discountCode: discountCodeDoc?._id,
      discountAmount,
      shippingAddress: shippingAddress || req.user.address
    });
    await createdOrder.save({ session });

    // Update product and variant stock within transaction
    for (const { product, quantity, matchedVariants } of productUpdates) {
      if (product.trackInventory) {
        if (matchedVariants && matchedVariants.length > 0) {
          // Update variant stock for all matched variants
          // Note: We update stock for the first variant that has stock defined
          // In a more complex system, you might want to track stock per variant combination
          let stockUpdated = false;
          for (const { variantType, variant } of matchedVariants) {
            const variantArray = product.variants.get(variantType);
            if (variantArray) {
              const variantIndex = variantArray.findIndex(
                v => v.value === variant.value
              );
              if (variantIndex !== -1) {
                const variantToUpdate = variantArray[variantIndex];
                if (variantToUpdate.stock !== undefined && variantToUpdate.stock !== null && !stockUpdated) {
                  variantToUpdate.stock -= quantity;
                  variantArray[variantIndex] = variantToUpdate;
                  product.variants.set(variantType, variantArray);
                  stockUpdated = true;
                }
              }
            }
          }
          // If no variant had stock defined, update product-level stock
          if (!stockUpdated) {
            product.stock -= quantity;
          }
        } else {
          // Update product-level stock
          product.stock -= quantity;
        }
        await product.save({ session });
      }
    }

    // Update discount code usage only after successful order creation
    if (discountCodeDoc) {
      discountCodeDoc.usedCount += 1;
      await discountCodeDoc.save({ session });
    }

    // Commit transaction
    await session.commitTransaction();

    // Send confirmation email (outside transaction)
    try {
      await createdOrder.populate('user', 'email name');
      await sendEmail(
        createdOrder.user.email,
        'Order Confirmation',
        orderConfirmationTemplate(createdOrder)
      );
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }

    await createdOrder.populate('items.product', 'name slug images');

    res.status(201).json({
      success: true,
      order: createdOrder
    });
  } catch (error) {
    // Rollback transaction on error
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error('Error aborting transaction:', abortError);
    }
    next(error);
  } finally {
    try {
      session.endSession();
    } catch (endError) {
      console.error('Error ending session:', endError);
    }
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Validate status enum
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    // Validate order ID
    if (!isValidObjectId(req.params.id)) {
      throw new AppError('Invalid order ID format', 400);
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};
