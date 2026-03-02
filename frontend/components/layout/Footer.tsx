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
                style={{ borderRadius: "0px" }}
                src="/assets/images/image.png"
                width={300}
                height={120}
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
          {/* <div className="col-6 col-lg-3">
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
          </div> */}
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright font2 mb-0 text-center">
            © {currentYear} Shahbaz. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
