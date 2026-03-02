'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useCart } from '@/lib/store/cart-store';
import { formatCurrency } from '@/lib/utils/currency';

interface CartProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Cart({ isOpen, onToggle }: CartProps) {
  const { items, total, removeItem, initializeCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  // Initialize cart from localStorage on mount
  useEffect(() => {
    initializeCart();
    setIsMounted(true);
  }, [initializeCart]);

  return (
    <div className="dropdown cart-dropdown">
      <a
        href="#"
        title="Cart"
        className="dropdown-toggle dropdown-arrow cart-toggle header-icon"
        role="button"
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
      >
        <i className="icon-cart-thick"></i>
        {isMounted && <span className="cart-count badge-circle">{items.length}</span>}
      </a>

      {isOpen && <div className="cart-overlay" onClick={onToggle}></div>}

      {isOpen && (
        <div className="dropdown-menu mobile-cart">
          <a
            href="#"
            title="Close (Esc)"
            className="btn-close"
            onClick={(e) => {
              e.preventDefault();
              onToggle();
            }}
          >
            ×
          </a>

          <div className="dropdownmenu-wrapper custom-scrollbar">
            <div className="dropdown-cart-header">Shopping Cart</div>
            {/* End .dropdown-cart-header */}

            <div className="dropdown-cart-products">
              {items.length === 0 ? (
                <p className="text-center p-3">Your cart is empty</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="product">
                    <div className="product-details">
                      <h4 className="product-title">
                        <Link href={`/product/${item.product.id}`}>{item.product.name}</Link>
                      </h4>
                      {item.variant && item.variant.attributes && (
                        <div className="product-variant-info" style={{ fontSize: '0.85em', marginTop: '4px' }}>
                          {Object.entries(item.variant.attributes).map(([key, value]) => (
                            <span key={key} style={{ marginRight: '4px', color: '#666' }}>
                              {key}: {value as string}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="cart-product-info">
                        <span className="cart-product-qty">{item.quantity}</span> × {formatCurrency(item.price)}
                      </span>
                    </div>
                    {/* End .product-details */}

                    <figure className="product-image-container">
                      <Link href={`/product/${item.product.id}`} className="product-image">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={80}
                          height={80}
                        />
                      </Link>
                      <a
                        href="#"
                        className="btn-remove"
                        title="Remove Product"
                        onClick={(e) => {
                          e.preventDefault();
                          removeItem(item.id);
                          toast.success(`${item.product.name} removed from cart`);
                        }}
                      >
                        <span>×</span>
                      </a>
                    </figure>
                  </div>
                ))
              )}
            </div>
            {/* End .cart-product */}

            {items.length > 0 && (
              <>
                <div className="dropdown-cart-total">
                  <span>SUBTOTAL:</span>
                  <span className="cart-total-price float-right">{formatCurrency(total)}</span>
                </div>
                {/* End .dropdown-cart-total */}

                <div className="dropdown-cart-action">
                  <Link href="/cart" className="btn btn-gray btn-block view-cart">
                    View Cart
                  </Link>
                  <Link 
                    href="/checkout" 
                    className="btn btn-dark btn-block"
                    onClick={() => {
                      onToggle();
                    }}
                  >
                    Checkout
                  </Link>
                </div>
                {/* End .dropdown-cart-total */}
              </>
            )}
          </div>
          {/* End .dropdownmenu-wrapper */}
        </div>
      )}
      {/* End .dropdown-menu */}
    </div>
  );
}

