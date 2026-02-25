'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HeaderLink } from '@/lib/api/headerLinks';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  headerLinks?: HeaderLink[];
}

export function MobileMenu({ isOpen, onClose, headerLinks = [] }: MobileMenuProps) {
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
              {headerLinks.length > 0 ? (
                headerLinks.map((link) => (
                  <li key={link._id || link.id}>
                    {link.openInNewTab ? (
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={onClose}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.url} onClick={onClose}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))
              ) : null}
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
                  Shop Shahbaz
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

