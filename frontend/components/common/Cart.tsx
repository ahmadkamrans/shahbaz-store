'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/store/cart-store';

interface CartProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Cart({ isOpen, onToggle }: CartProps) {
  const { items, total } = useCart();

  return (
    <div className="dropdown cart-dropdown">
      <a
        href="#"
        title="Cart"
        className="dropdown-toggle dropdown-arrow cart-toggle"
        role="button"
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
      >
        <i className="minicart-icon"></i>
        <span className="cart-count badge-circle">{items.length}</span>
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
                      <span className="cart-product-info">
                        <span className="cart-product-qty">{item.quantity}</span> × ${item.price.toFixed(2)}
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
                          // Handle remove
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
                  <span className="cart-total-price float-right">${total.toFixed(2)}</span>
                </div>
                {/* End .dropdown-cart-total */}

                <div className="dropdown-cart-action">
                  <Link href="/cart" className="btn btn-gray btn-block view-cart">
                    View Cart
                  </Link>
                  <Link href="/checkout" className="btn btn-dark btn-block">
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

