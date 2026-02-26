"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Cart } from "../common/Cart";
import { Search } from "../common/Search";
import { MobileMenu } from "./MobileMenu";
import { useCart } from "@/lib/store/cart-store";
import { headerLinksApi, HeaderLink } from "@/lib/api/headerLinks";

const DEFAULT_NAV_LINKS: HeaderLink[] = [
  { id: "home", label: "Home", url: "/", order: 0 },
  { id: "products", label: "Products", url: "/products", order: 1 },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [headerLinks, setHeaderLinks] = useState<HeaderLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const { initializeCart } = useCart();

  // Fetch header links from API
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const links = await headerLinksApi.getAll();
        setHeaderLinks(links);
      } catch (error) {
        console.error("Error fetching header links:", error);
        // Fallback to empty array on error
        setHeaderLinks([]);
      } finally {
        setLinksLoading(false);
      }
    };

    fetchLinks();
  }, []);

  // Determine active page based on pathname
  const isLinkActive = (url: string) => {
    if (url === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(url);
  };

  // Initialize cart from localStorage on mount
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  // Sync body class so theme CSS shows cart as right sidebar/canvas with overlay
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (cartOpen) {
      document.body.classList.add("cart-opened");
    } else {
      document.body.classList.remove("cart-opened");
    }
    return () => document.body.classList.remove("cart-opened");
  }, [cartOpen]);

  return (
    <header className="header mb-2">
      <div className="header-middle sticky-header">
        <div className="container">
          <div className="header-left pl-0">
            <nav className="main-nav w-100">
              <ul className="menu">
                {linksLoading ? (
                  <li>
                    <div className="text-white" style={{ padding: "21px 0px" }}>
                      Loading...
                    </div>
                  </li>
                ) : (
                  (headerLinks.length > 0
                    ? headerLinks
                    : DEFAULT_NAV_LINKS
                  ).map((link) => (
                    <li
                      key={link._id || link.id}
                      className={isLinkActive(link.url) ? "active" : ""}
                    >
                      {link.openInNewTab ? (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.url}>{link.label}</Link>
                      )}
                    </li>
                  ))
                )}
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

          <Link href="/" className="logo header-logo-center ">
            <Image
              style={{ borderRadius: "8px" }}
              src="/assets/images/logo-navbar.jpeg"
              width={180}
              height={72}
              alt="Shahbaz"
            />
          </Link>

          <div className="header-right">
            <Link href="/login" className="header-icon" title="Login">
              <i className="icon-user-2"></i>
            </Link>

            <Search
              isOpen={searchOpen}
              onToggle={() => setSearchOpen(!searchOpen)}
            />

            <Link
              href="/wishlist"
              className="header-icon header-icon-wishlist"
              title="Wishlist"
            >
              <i className="icon-wishlist-2"></i>
            </Link>

            <Cart isOpen={cartOpen} onToggle={() => setCartOpen(!cartOpen)} />
          </div>
          {/* End .header-right */}
        </div>
        {/* End .container */}
      </div>
      {/* End .header-middle */}

      <div className="container mt-4">
        <div className="header-bottom w-100">
          <h4 className="mb-0 text-center pr-3 pl-3">
            Get 10% OFF at the Shahbaz Kitchen Selection -{" "}
            <Link href="/products">Shop Now!</Link>
          </h4>
        </div>
      </div>
      {/* End .header-top */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        headerLinks={headerLinks.length > 0 ? headerLinks : DEFAULT_NAV_LINKS}
      />
    </header>
  );
}
