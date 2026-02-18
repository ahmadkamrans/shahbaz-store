import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
}

export function ProductCard({ product, showQuickView = true }: ProductCardProps) {
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="product-default">
      <figure>
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.image}
            alt={product.name}
            width={327}
            height={327}
          />
        </Link>
      </figure>
      <div className="product-details">
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
              style={{ width: `${(product.rating || 0) * 20}%` }}
            ></span>
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
          <Link href="/wishlist" title="Wishlist" className="btn-icon-wish">
            <i className="icon-heart"></i>
          </Link>
          <a
            href="#"
            className="btn-icon btn-add-cart product-type-simple"
            onClick={(e) => {
              e.preventDefault();
              // Handle add to cart
            }}
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
                // Handle quick view
              }}
            >
              <i className="fas fa-external-link-alt"></i>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

