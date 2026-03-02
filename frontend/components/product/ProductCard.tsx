"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useWishlist } from '@/lib/store/wishlist-store';
import { useCart } from '@/lib/store/cart-store';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
  viewMode?: 'grid' | 'list';
  /** Shop page theme layout: inner-quickview inner-icon with figure/btn-icon-group */
  variant?: 'default' | 'shop';
}

export function ProductCard({
  product,
  showQuickView = true,
  viewMode = 'grid',
  variant = 'default',
}: ProductCardProps) {
  const { addItem: addToWishlist, removeItem, isInWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (isInWishlist(product.id)) {
        await removeItem(product.id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update wishlist');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart`, { icon: '🛒' });
  };

  if (variant === 'shop') {
    return (
      <div className="product-default inner-quickview inner-icon">
        <figure>
          <Link href={`/product/${product.slug}`}>
            <Image
              src={product.image}
              alt={product.name}
              width={257}
              height={257}
            />
          </Link>
          <div className="btn-icon-group">
            <a
              href="#"
              className="btn-icon btn-add-cart product-type-simple"
              onClick={handleAddToCart}
            >
              <i className="icon-shopping-cart"></i>
            </a>
          </div>
          <a
            href="#"
            className="btn-quickview"
            title="Quick View"
            onClick={(e) => {
              e.preventDefault();
              setQuickViewProduct(product);
            }}
          >
            Quick View
          </a>
        </figure>
        <div className="product-details">
          <div className="category-wrap">
            <div className="category-list">
              <Link href="/products" className="product-category">
                {product.category || 'category'}
              </Link>
            </div>
            <a
              href="#"
              title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={`btn-icon-wish ${isInWishlist(product.id) ? 'added-wishlist' : ''}`}
              onClick={handleToggleWishlist}
            >
              <i className="icon-heart"></i>
            </a>
          </div>
          <h3 className="product-title">
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
          <div className="ratings-container">
            <div className="product-ratings">
              <span
                className="ratings"
                style={{ width: `${(product.rating || 0) * 20}%`, color: '#ffc107' }}
              />
              <span className="tooltiptext tooltip-top"></span>
            </div>
          </div>
          <div className="price-box">
            {product.oldPrice && product.oldPrice > product.price && (
              <del className="old-price">{formatPrice(product.oldPrice)}</del>
            )}
            <span className="product-price">{formatPrice(product.price)}</span>
          </div>
        </div>
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      </div>
    );
  }

  return (
    <div className={`product-default ${viewMode === 'list' ? 'product-list' : ''}`}>
      <figure className={viewMode === 'list' ? 'col-md-4' : ''}>
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.image}
            alt={product.name}
            width={327}
            height={327}
          />
        </Link>
      </figure>
      <div className={`product-details ${viewMode === 'list' ? 'col-md-8' : ''}`}>
        <div className="category-list">
          <Link href="/products" className="product-category">
            {product.category}
          </Link>
        </div>
        <h3 className="product-title">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="ratings-container">
          <div className="product-ratings">
            <span
              className="ratings"
              style={{ width: `${(product.rating || 0) * 20}%`, color: '#ffc107' }}
            />
            <span className="tooltiptext tooltip-top"></span>
          </div>
        </div>
        <div className="price-box">
          {product.oldPrice && (
            <del className="old-price">{formatPrice(product.oldPrice)}</del>
          )}
          <span className="product-price">{formatPrice(product.price)}</span>
        </div>
        <div className="product-action">
          <a
            href="#"
            title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={`btn-icon-wish ${isInWishlist(product.id) ? 'added-wishlist' : ''}`}
            onClick={handleToggleWishlist}
          >
            <i className="icon-heart"></i>
          </a>
          <a
            href="#"
            className="btn-icon btn-add-cart product-type-simple"
            onClick={handleAddToCart}
          >
            <i className="icon-shopping-cart"></i>
            <span>ADD TO CART</span>
          </a>
          {showQuickView && (
            <a
              href="#"
              className="btn-quickview"
              title="Quick View"
              onClick={(e) => {
                e.preventDefault();
                setQuickViewProduct(product);
              }}
            >
              <i className="fas fa-external-link-alt"></i>
            </a>
          )}
        </div>
      </div>
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

