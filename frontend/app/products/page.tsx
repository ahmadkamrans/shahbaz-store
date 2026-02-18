"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Product } from "@/types";

// Demo products
const products: Product[] = Array.from({ length: 24 }, (_, i) => ({
  id: `product-${i + 1}`,
  name: `Product ${i + 1}`,
  slug: `product-${i + 1}`,
  price: 49.0 + i * 10,
  oldPrice: 59.0 + i * 10,
  image: `/assets/images/products/product-${(i % 24) + 1}.jpg`,
  category: "Category",
  rating: 4,
}));

export default function ProductsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState("default");

  return (
    <main className="main">
      <div className="category-banner-container bg-gray">
        <div
          className="category-banner banner text-uppercase"
          style={{
            background:
              "no-repeat 60%/cover url('/assets/images/banners/banner-top.jpg')",
          }}
        >
          <div className="container position-relative">
            <div className="row">
              <div className="pl-lg-5 pb-5 pb-md-0 col-md-5 col-xl-4 col-lg-4 offset-1">
                <h3>
                  All<br></br>Products
                </h3>
                <Link href="/products" className="btn btn-dark">
                  Shop Now
                </Link>
              </div>
              <div className="pl-lg-3 col-md-4 offset-md-0 offset-1 pt-3">
                <div className="coupon-sale-content">
                  <h4 className="m-b-1 coupon-sale-text bg-white text-transform-none">
                    Browse Collection
                  </h4>
                  <h5 className="mb-2 coupon-sale-text d-block ls-10 p-0">
                    <i className="ls-0">Discover</i>
                    <b className="text-dark"> great deals</b>
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <nav aria-label="breadcrumb" className="breadcrumb-nav">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">
                <i className="icon-home"></i>
              </Link>
            </li>
            <li className="breadcrumb-item">
              <a href="#">Men</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Accessories
            </li>
          </ol>
        </nav>

        <nav className="toolbox sticky-header">
          <div className="toolbox-left">
            <a
              href="#"
              className="sidebar-toggle"
              onClick={(e) => {
                e.preventDefault();
                setSidebarOpen(!sidebarOpen);
              }}
            >
              <svg
                data-name="Layer 3"
                id="Layer_3"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line x1="15" x2="26" y1="9" y2="9" className="cls-1"></line>
                <line x1="6" x2="9" y1="9" y2="9" className="cls-1"></line>
                <line x1="23" x2="26" y1="16" y2="16" className="cls-1"></line>
                <line x1="6" x2="17" y1="16" y2="16" className="cls-1"></line>
                <line x1="17" x2="26" y1="23" y2="23" className="cls-1"></line>
                <line x1="6" x2="13" y1="23" y2="23" className="cls-1"></line>
              </svg>
            </a>
            <div className="toolbox-item toolbox-sort">
              <label>Sort By:</label>
              <div className="select-custom">
                <select
                  name="orderby"
                  className="form-control"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">Default sorting</option>
                  <option value="popularity">Sort by popularity</option>
                  <option value="rating">Sort by average rating</option>
                  <option value="date">Sort by latest</option>
                  <option value="price">Sort by price: low to high</option>
                  <option value="price-desc">Sort by price: high to low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="toolbox-right">
            <div className="toolbox-item toolbox-show">
              <label>Show:</label>
              <div className="select-custom">
                <select name="count" className="form-control">
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="36">36</option>
                </select>
              </div>
            </div>

            <div className="toolbox-item layout-modes">
              <a href="#" className="layout-btn btn-grid active" title="Grid">
                <i className="icon-mode-grid"></i>
              </a>
              <a href="#" className="layout-btn btn-list" title="List">
                <i className="icon-mode-list"></i>
              </a>
            </div>
          </div>
        </nav>

        <div className="row">
          {/* <aside
            className={`sidebar-shop sidebar-fixed sidebar-toggle sidebar-${sidebarOpen ? 'opened' : 'closed'}`}
          >
            <div className="sidebar-content-wrapper">
              <div className="sidebar-content">
                <div className="widget widget-clean">
                  <label>
                    <i className="icon-close"></i>Filters
                  </label>
                  <a href="#" className="sidebar-toggle-clean">
                    Clean All
                  </a>
                </div>

                <div className="widget">
                  <h3 className="widget-title">Filter by Price</h3>
                  <div className="widget-body">
                    <div className="price-slider-wrapper">
                      <div
                        id="price-slider"
                        className="nouislider-price"
                        data-min="0"
                        data-max="1000"
                      ></div>
                      <div className="filter-price-action d-flex align-items-center justify-content-between flex-wrap">
                        <div className="filter-price-text">
                          <span id="filter-price-range"></span>
                        </div>
                        <a href="#" className="btn btn-primary">
                          Filter
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="widget">
                  <h3 className="widget-title">Size</h3>
                  <div className="widget-body">
                    <ul className="cat-list">
                      <li>
                        <a href="#">Small</a>
                      </li>
                      <li>
                        <a href="#">Medium</a>
                      </li>
                      <li>
                        <a href="#">Large</a>
                      </li>
                      <li>
                        <a href="#">Extra Large</a>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="widget">
                  <h3 className="widget-title">Color</h3>
                  <div className="widget-body">
                    <ul className="config-swatch-list">
                      <li>
                        <a href="#" className="swatch" data-toggle="tooltip" title="White">
                          <span style={{ backgroundColor: '#fff' }}></span>
                        </a>
                      </li>
                      <li>
                        <a href="#" className="swatch" data-toggle="tooltip" title="Black">
                          <span style={{ backgroundColor: '#000' }}></span>
                        </a>
                      </li>
                      <li>
                        <a href="#" className="swatch" data-toggle="tooltip" title="Red">
                          <span style={{ backgroundColor: '#ff0000' }}></span>
                        </a>
                      </li>
                      <li>
                        <a href="#" className="swatch" data-toggle="tooltip" title="Blue">
                          <span style={{ backgroundColor: '#0000ff' }}></span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </aside> */}

          <div className="col-lg-12 col-xl-12">
            <ProductGrid products={products} columns={6} />

            <nav className="toolbox toolbox-pagination">
              <div className="toolbox-item toolbox-show">
                <label>Show:</label>
                <div className="select-custom">
                  <select name="count" className="form-control">
                    <option value="12">12</option>
                    <option value="24">24</option>
                    <option value="36">36</option>
                  </select>
                </div>
              </div>

              <ul className="pagination">
                <li className="page-item disabled">
                  <a className="page-link page-link-btn" href="#">
                    <i className="icon-angle-left"></i>
                  </a>
                </li>
                <li className="page-item active">
                  <a className="page-link" href="#">
                    1 <span className="sr-only">(current)</span>
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    2
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    3
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link page-link-btn" href="#">
                    <i className="icon-angle-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}
