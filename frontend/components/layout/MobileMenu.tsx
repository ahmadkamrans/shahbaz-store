'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-menu-overlay" onClick={onClose}></div>
      <div className="mobile-menu-container">
        <div className="mobile-menu-wrapper">
          <span className="mobile-menu-close" onClick={onClose}>
            <i className="fa fa-times"></i>
          </span>
          <nav className="mobile-nav">
            <ul className="mobile-menu">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleMenu('categories');
                  }}
                >
                  Categories
                </a>
                {expandedMenus.includes('categories') && (
                  <ul>
                    <li>
                      <Link href="/products">Full Width Banner</Link>
                    </li>
                    <li>
                      <Link href="/products">Boxed Slider Banner</Link>
                    </li>
                    <li>
                      <Link href="/products">Boxed Image Banner</Link>
                    </li>
                    <li>
                      <Link href="/products">Left Sidebar</Link>
                    </li>
                    <li>
                      <Link href="/products">Right Sidebar</Link>
                    </li>
                    <li>
                      <Link href="/products">Off Canvas Filter</Link>
                    </li>
                    <li>
                      <Link href="/products">Horizontal Filter 1</Link>
                    </li>
                    <li>
                      <Link href="/products">Horizontal Filter 2</Link>
                    </li>
                    <li>
                      <Link href="/products">List Types</Link>
                    </li>
                    <li>
                      <Link href="/products">
                        Ajax Infinite Scroll
                        <span className="tip tip-new">New</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/products">3 Columns Products</Link>
                    </li>
                    <li>
                      <Link href="/products">4 Columns Products</Link>
                    </li>
                    <li>
                      <Link href="/products">5 Columns Products</Link>
                    </li>
                    <li>
                      <Link href="/products">6 Columns Products</Link>
                    </li>
                    <li>
                      <Link href="/products">7 Columns Products</Link>
                    </li>
                    <li>
                      <Link href="/products">8 Columns Products</Link>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleMenu('products');
                  }}
                >
                  Products
                </a>
                {expandedMenus.includes('products') && (
                  <ul>
                    <li>
                      <a href="#" className="nolink">
                        PRODUCT PAGES
                      </a>
                      <ul>
                        <li>
                          <Link href="/product/1">SIMPLE PRODUCT</Link>
                        </li>
                        <li>
                          <Link href="/product/1">VARIABLE PRODUCT</Link>
                        </li>
                        <li>
                          <Link href="/product/1">SALE PRODUCT</Link>
                        </li>
                        <li>
                          <Link href="/product/1">FEATURED & ON SALE</Link>
                        </li>
                        <li>
                          <Link href="/product/1">WIDTH CUSTOM TAB</Link>
                        </li>
                        <li>
                          <Link href="/product/1">WITH LEFT SIDEBAR</Link>
                        </li>
                        <li>
                          <Link href="/product/1">WITH RIGHT SIDEBAR</Link>
                        </li>
                        <li>
                          <Link href="/product/1">ADD CART STICKY</Link>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a href="#" className="nolink">
                        PRODUCT LAYOUTS
                      </a>
                      <ul>
                        <li>
                          <Link href="/product/1">EXTENDED LAYOUT</Link>
                        </li>
                        <li>
                          <Link href="/product/1">GRID IMAGE</Link>
                        </li>
                        <li>
                          <Link href="/product/1">FULL WIDTH LAYOUT</Link>
                        </li>
                        <li>
                          <Link href="/product/1">STICKY INFO</Link>
                        </li>
                        <li>
                          <Link href="/product/1">LEFT & RIGHT STICKY</Link>
                        </li>
                        <li>
                          <Link href="/product/1">TRANSPARENT IMAGE</Link>
                        </li>
                        <li>
                          <Link href="/product/1">CENTER VERTICAL</Link>
                        </li>
                        <li>
                          <Link href="/product/1">BUILD YOUR OWN</Link>
                        </li>
                      </ul>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleMenu('pages');
                  }}
                >
                  Pages<span className="tip tip-hot">Hot!</span>
                </a>
                {expandedMenus.includes('pages') && (
                  <ul>
                    <li>
                      <Link href="/wishlist">Wishlist</Link>
                    </li>
                    <li>
                      <Link href="/cart">Shopping Cart</Link>
                    </li>
                    <li>
                      <Link href="/checkout">Checkout</Link>
                    </li>
                    <li>
                      <Link href="/dashboard">Dashboard</Link>
                    </li>
                    <li>
                      <Link href="/login">Login</Link>
                    </li>
                    <li>
                      <Link href="/forgot-password">Forgot Password</Link>
                    </li>
                  </ul>
                )}
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
            </ul>

            <ul className="mobile-menu mt-2 mb-2">
              <li className="border-0">
                <a href="#">Special Offer!</a>
              </li>
              <li className="border-0">
                <a
                  href="https://1.envato.market/DdLk5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy Porto!
                  <span className="tip tip-hot">Hot</span>
                </a>
              </li>
            </ul>

            <ul className="mobile-menu">
              <li>
                <Link href="/login">My Account</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/wishlist">My Wishlist</Link>
              </li>
              <li>
                <Link href="/cart">Cart</Link>
              </li>
              <li>
                <Link href="/login" className="login-link">
                  Log In
                </Link>
              </li>
            </ul>
          </nav>
          {/* End .mobile-nav */}

          <form className="search-wrapper mb-2" action="#">
            <input
              type="text"
              className="form-control mb-0"
              placeholder="Search..."
              required
            />
            <button
              className="btn icon-search text-white bg-transparent p-0"
              type="submit"
            ></button>
          </form>

          <div className="social-icons">
            <a
              href="#"
              className="social-icon social-facebook icon-facebook"
              target="_blank"
              rel="noopener noreferrer"
            ></a>
            <a
              href="#"
              className="social-icon social-twitter icon-twitter"
              target="_blank"
              rel="noopener noreferrer"
            ></a>
            <a
              href="#"
              className="social-icon social-instagram icon-instagram"
              target="_blank"
              rel="noopener noreferrer"
            ></a>
          </div>
        </div>
        {/* End .mobile-menu-wrapper */}
      </div>
      {/* End .mobile-menu-container */}
    </>
  );
}

