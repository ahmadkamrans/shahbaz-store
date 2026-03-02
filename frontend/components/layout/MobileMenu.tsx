"use client";

import Link from "next/link";
import Image from "next/image";
import { HeaderLink } from "@/lib/api/headerLinks";
import { useCart } from "@/lib/store/cart-store";

const HEADER_GRADIENT =
  "linear-gradient(126deg, rgba(255, 168, 168, 1) 0%, rgba(112, 14, 119, 1) 36%, rgba(112, 14, 119, 1) 70%)";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  headerLinks?: HeaderLink[];
}

export function MobileMenu({
  isOpen,
  onClose,
  headerLinks = [],
}: MobileMenuProps) {
  const { items: cartItems } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-menu-overlay" onClick={onClose}></div>
      <div
        className="mobile-menu-container mobile-menu-container--header-bg"
        style={{ background: HEADER_GRADIENT }}
      >
        <div className="mobile-menu-wrapper">
          <span className="mobile-menu-close" onClick={onClose}>
            <i className="fa fa-times"></i>
          </span>
          <div
            className="mb-3"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Link href="/" onClick={onClose}>
              <Image
                src="/assets/images/image.png"
                width={160}
                height={80}
                alt="Shahbaz Store"
                style={{
                  borderRadius: "8px",
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
            </Link>
          </div>
          <nav className="mobile-nav">
            <ul className="mobile-menu">
              {headerLinks.map((link) => (
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
              ))}
            </ul>
          </nav>

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
        </div>
      </div>
    </>
  );
}
