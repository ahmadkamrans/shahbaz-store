'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Cart } from '../common/Cart';
import { Search } from '../common/Search';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Sync body class so theme CSS shows cart as right sidebar/canvas with overlay
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (cartOpen) {
      document.body.classList.add('cart-opened');
    } else {
      document.body.classList.remove('cart-opened');
    }
    return () => document.body.classList.remove('cart-opened');
  }, [cartOpen]);

  return (
    <header className="header mb-2">
      <div className="header-middle sticky-header">
        <div className="container">
          <div className="header-left pl-0">
            <nav className="main-nav w-100">
              <ul className="menu">
                <li className="active">
                  <Link href="/">Home</Link>
                </li>
                <li
                  onMouseEnter={() => setActiveMenu('products')}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link href="/products">Products</Link>
                  {activeMenu === 'products' && (
                    <div className="megamenu megamenu-fixed-width">
                      <div className="row">
                        <div className="col-lg-4">
                          <a href="#" className="nolink">PRODUCT PAGES</a>
                          <ul className="submenu">
                            <li><Link href="/product/1">SIMPLE PRODUCT</Link></li>
                            <li><Link href="/product/1">VARIABLE PRODUCT</Link></li>
                            <li><Link href="/product/1">SALE PRODUCT</Link></li>
                            <li><Link href="/product/1">FEATURED & ON SALE</Link></li>
                            <li><Link href="/product/1">WITH CUSTOM TAB</Link></li>
                            <li><Link href="/product/1">WITH LEFT SIDEBAR</Link></li>
                            <li><Link href="/product/1">WITH RIGHT SIDEBAR</Link></li>
                            <li><Link href="/product/1">ADD CART STICKY</Link></li>
                          </ul>
                        </div>
                        <div className="col-lg-4">
                          <a href="#" className="nolink">PRODUCT LAYOUTS</a>
                          <ul className="submenu">
                            <li><Link href="/product/1">EXTENDED LAYOUT</Link></li>
                            <li><Link href="/product/1">GRID IMAGE</Link></li>
                            <li><Link href="/product/1">FULL WIDTH LAYOUT</Link></li>
                            <li><Link href="/product/1">STICKY INFO</Link></li>
                            <li><Link href="/product/1">LEFT & RIGHT STICKY</Link></li>
                            <li><Link href="/product/1">TRANSPARENT IMAGE</Link></li>
                            <li><Link href="/product/1">CENTER VERTICAL</Link></li>
                            <li><Link href="/product/1">BUILD YOUR OWN</Link></li>
                          </ul>
                        </div>
                        <div className="col-lg-4 p-0">
                          <div className="menu-banner menu-banner-2">
                            <figure>
                              <Image
                                src="/assets/images/menu-banner-1.jpg"
                                alt="Menu banner"
                                className="product-promo"
                                width={380}
                                height={790}
                              />
                            </figure>
                            <i>OFF</i>
                            <div className="banner-content">
                              <h4>
                                <span className="">UP TO</span><br />
                                <b className="">50%</b>
                              </h4>
                            </div>
                            <Link href="/products" className="btn btn-sm btn-dark">SHOP NOW</Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              </ul>
            </nav>
          </div>
          {/* End .header-left */}
          <div className="header-center ml-lg-auto ml-0">
            <button
              className="mobile-menu-toggler text-dark mr-2"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>

          <Link href="/" className="logo header-logo-center">
            <Image
              src="/assets/images/logo-black.png"
              width={180}
              height={72}
              alt="Porto Logo"
            />
          </Link>

          <div className="header-right">
            <Link href="/login" className="header-icon" title="Login">
              <i className="icon-user-2"></i>
            </Link>

            <Search isOpen={searchOpen} onToggle={() => setSearchOpen(!searchOpen)} />

            <Link href="/wishlist" className="header-icon header-icon-wishlist" title="Wishlist">
              <i className="icon-wishlist-2"></i>
            </Link>

            <Cart isOpen={cartOpen} onToggle={() => setCartOpen(!cartOpen)} />
          </div>
          {/* End .header-right */}
        </div>
        {/* End .container */}
      </div>
      {/* End .header-middle */}

      <div className="container">
        <div className="header-bottom w-100">
          <h4 className="mb-0 text-center pr-3 pl-3">
            Get 10% OFF at the Porto Kitchen Selection -{' '}
            <Link href="/products">Shop Now!</Link>
          </h4>
        </div>
      </div>
      {/* End .header-top */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}

