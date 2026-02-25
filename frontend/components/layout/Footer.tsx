"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-middle row">
          <div className="col-6 col-lg-3">
            <Link href="/" className="logo-footer">
              <Image
                src="/assets/images/logo.jpeg"
                width={280}
                height={58}
                alt="Shahbaz"
              />
            </Link>
            <p className="mt-2 mb-0 text-body">
              Your trusted store for quality products.
            </p>
          </div>
          <div className="col-6 col-lg-3">
            <div className="widget">
              <h3 className="widget-title">Account</h3>
              <div className="widget-content">
                <ul>
                  <li>
                    <Link href="/login">Login</Link>
                  </li>
                  <li>
                    <Link href="/wishlist">Wishlist</Link>
                  </li>
                  <li>
                    <Link href="/cart">Cart</Link>
                  </li>
                  <li>
                    <Link href="/checkout">Checkout</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="widget">
              <h3 className="widget-title">About</h3>
              <div className="widget-content">
                <ul>
                  <li>
                    <Link href="/about">About Shahbaz</Link>
                  </li>
                  <li>
                    <a href="#">Contact</a>
                  </li>
                  <li>
                    <a href="#">Terms & Conditions</a>
                  </li>
                  <li>
                    <a href="#">Privacy Policy</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="widget">
              <h3 className="widget-title">Follow Us</h3>
              <div className="widget-content">
                <div className="social-icons">
                  <a
                    href="#"
                    className="social-icon social-facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook"
                  >
                    <i className="icon-facebook"></i>
                  </a>
                  <a
                    href="#"
                    className="social-icon social-twitter"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Twitter"
                  >
                    <i className="icon-twitter"></i>
                  </a>
                  <a
                    href="#"
                    className="social-icon social-instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram"
                  >
                    <i className="icon-instagram"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom d-lg-flex align-items-center">
          <p className="footer-copyright font2 mb-0">
            © {currentYear} Shahbaz. All Rights Reserved.
          </p>
          <Image
            className="ml-lg-auto ml-0 mt-lg-0 mt-1"
            src="/assets/images/demoes/demo29/payments_long.png"
            width={255}
            height={22}
            alt="payment"
          />
        </div>
      </div>
    </footer>
  );
}
