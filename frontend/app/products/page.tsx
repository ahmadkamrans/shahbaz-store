"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Product } from "@/types";
import { productsApi } from "@/lib/api/products";
import { formatPrice } from "@/lib/utils";
import { categoriesApi } from "@/lib/api/categories";
import { Category } from "@/types";
import { useWishlist } from "@/lib/store/wishlist-store";

// Fallback products when API fails or returns empty (e.g. backend not running)
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Sample Product 1",
    slug: "sample-product-1",
    price: 49,
    image: "/assets/images/products/product-1.jpg",
    category: "Uncategorized",
    rating: 4,
  },
  {
    id: "2",
    name: "Sample Product 2",
    slug: "sample-product-2",
    price: 59,
    image: "/assets/images/products/product-2.jpg",
    category: "Uncategorized",
    rating: 5,
  },
  {
    id: "3",
    name: "Sample Product 3",
    slug: "sample-product-3",
    price: 39,
    image: "/assets/images/products/product-3.jpg",
    category: "Uncategorized",
    rating: 4,
  },
  {
    id: "4",
    name: "Sample Product 4",
    slug: "sample-product-4",
    price: 69,
    image: "/assets/images/products/product-4.jpg",
    category: "Uncategorized",
    rating: 3,
  },
  {
    id: "5",
    name: "Sample Product 5",
    slug: "sample-product-5",
    price: 45,
    image: "/assets/images/products/product-5.jpg",
    category: "Uncategorized",
    rating: 5,
  },
  {
    id: "6",
    name: "Sample Product 6",
    slug: "sample-product-6",
    price: 55,
    image: "/assets/images/products/product-6.jpg",
    category: "Uncategorized",
    rating: 4,
  },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { fetchWishlist } = useWishlist();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState("menu_order");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiFailed, setApiFailed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Fetch wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Mobile sidebar: body class for overlay
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (sidebarOpen) {
      document.body.classList.add("sidebar-opened");
    } else {
      document.body.classList.remove("sidebar-opened");
    }
    return () => document.body.classList.remove("sidebar-opened");
  }, [sidebarOpen]);

  // Read search query from URL params on mount
  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery(""); // Clear search query when no search param in URL
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setApiFailed(false);
        const cats = await categoriesApi.getCategories().catch(() => []);
        setCategories(Array.isArray(cats) ? cats : []);

        const sortMap: Record<
          string,
          { sortBy?: string; sortOrder?: "asc" | "desc" }
        > = {
          menu_order: {},
          default: {},
          popularity: { sortBy: "averageRating", sortOrder: "desc" },
          rating: { sortBy: "averageRating", sortOrder: "desc" },
          date: { sortBy: "createdAt", sortOrder: "desc" },
          price: { sortBy: "price", sortOrder: "asc" },
          "price-desc": { sortBy: "price", sortOrder: "desc" },
        };

        const sortParams = sortMap[sortBy] || {};
        const response = await productsApi.getProducts({
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
          page,
          limit: itemsPerPage,
          minPrice: minPrice > 0 ? minPrice : undefined,
          maxPrice: maxPrice < 1000 ? maxPrice : undefined,
          ...sortParams,
        });

        const list = response?.products ?? [];
        if (list.length > 0) {
          setProducts(list);
          setTotalPages(response.totalPages ?? 1);
        } else {
          setProducts(FALLBACK_PRODUCTS);
          setTotalPages(1);
          setApiFailed(true);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts(FALLBACK_PRODUCTS);
        setTotalPages(1);
        setApiFailed(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    sortBy,
    selectedCategory,
    searchQuery,
    page,
    itemsPerPage,
    minPrice,
    maxPrice,
  ]);

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
            {searchQuery && (
              <>
                <li className="breadcrumb-item">
                  <Link href="/products">Products</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Search: "{searchQuery}"
                </li>
              </>
            )}
            {!searchQuery && selectedCategory && (
              <>
                <li className="breadcrumb-item">
                  <Link href="/products">Products</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {categories.find((c) => c.id === selectedCategory)?.name ||
                    "Category"}
                </li>
              </>
            )}
            {!searchQuery && !selectedCategory && (
              <li className="breadcrumb-item active" aria-current="page">
                All Products
              </li>
            )}
          </ol>
        </nav>

        {searchQuery && (
          <div className="search-results-header mb-4">
            <h2 className="mb-2">Search Results for "{searchQuery}"</h2>
            <p className="text-muted">
              {loading
                ? "Searching..."
                : `Found ${products.length} product${products.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        )}

        <div className="row main-content-wrapper mb-2 pb-2">
          <div className="col-lg-9">
            <nav
              className="toolbox sticky-header"
              data-sticky-options="{'mobile': true}"
            >
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
                    <line
                      x1="15"
                      x2="26"
                      y1="9"
                      y2="9"
                      className="cls-1"
                    ></line>
                    <line x1="6" x2="9" y1="9" y2="9" className="cls-1"></line>
                    <line
                      x1="23"
                      x2="26"
                      y1="16"
                      y2="16"
                      className="cls-1"
                    ></line>
                    <line
                      x1="6"
                      x2="17"
                      y1="16"
                      y2="16"
                      className="cls-1"
                    ></line>
                    <line
                      x1="17"
                      x2="26"
                      y1="23"
                      y2="23"
                      className="cls-1"
                    ></line>
                    <line
                      x1="6"
                      x2="11"
                      y1="23"
                      y2="23"
                      className="cls-1"
                    ></line>
                    <path
                      d="M14.5,8.92A2.6,2.6,0,0,1,12,11.5,2.6,2.6,0,0,1,9.5,8.92a2.5,2.5,0,0,1,5,0Z"
                      className="cls-2"
                    ></path>
                    <path
                      d="M22.5,15.92a2.5,2.5,0,1,1-5,0,2.5,2.5,0,0,1,5,0Z"
                      className="cls-2"
                    ></path>
                    <path
                      d="M21,16a1,1,0,1,1-2,0,1,1,0,0,1,2,0Z"
                      className="cls-3"
                    ></path>
                    <path
                      d="M16.5,22.92A2.6,2.6,0,0,1,14,25.5a2.6,2.6,0,0,1-2.5-2.58,2.5,2.5,0,0,1,5,0Z"
                      className="cls-2"
                    ></path>
                  </svg>
                  <span>Filter</span>
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
                      <option value="menu_order">Default sorting</option>
                      <option value="popularity">Sort by popularity</option>
                      <option value="rating">Sort by average rating</option>
                      <option value="date">Sort by newness</option>
                      <option value="price">Sort by price: low to high</option>
                      <option value="price-desc">
                        Sort by price: high to low
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="toolbox-right">
                <div className="toolbox-item toolbox-show">
                  <label>Show:</label>
                  <div className="select-custom">
                    <select
                      name="count"
                      className="form-control"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setPage(1); // Reset to first page when changing items per page
                      }}
                    >
                      <option value="12">12</option>
                      <option value="24">24</option>
                      <option value="36">36</option>
                    </select>
                  </div>
                </div>

                <div className="toolbox-item layout-modes">
                  <a
                    href="#"
                    className={`layout-btn btn-grid ${viewMode === "grid" ? "active" : ""}`}
                    title="Grid"
                    onClick={(e) => {
                      e.preventDefault();
                      setViewMode("grid");
                    }}
                  >
                    <i className="icon-mode-grid"></i>
                  </a>
                  <a
                    href="#"
                    className={`layout-btn btn-list ${viewMode === "list" ? "active" : ""}`}
                    title="List"
                    onClick={(e) => {
                      e.preventDefault();
                      setViewMode("list");
                    }}
                  >
                    <i className="icon-mode-list"></i>
                  </a>
                </div>
              </div>
            </nav>

            {apiFailed && (
              <div className="alert alert-info mb-3" role="alert">
                Could not load products from the server. Showing sample
                products. Start the backend and refresh to load real data.
              </div>
            )}
            <div className="row products-body">
              {loading ? (
                <div className="col-12 text-center py-5">
                  <p>Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="col-12 text-center py-5">
                  <p>No products found.</p>
                </div>
              ) : (
                <ProductGrid
                  products={products}
                  viewMode={viewMode}
                  columnClass="col-6 col-md-4 col-lg-3 col-xl-5col"
                />
              )}
            </div>

            <nav className="toolbox toolbox-pagination font2">
              <div className="toolbox-item toolbox-show">
                <label>Show:</label>
                <div className="select-custom">
                  <select
                    name="count"
                    className="form-control"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    <option value="12">12</option>
                    <option value="24">24</option>
                    <option value="36">36</option>
                  </select>
                </div>
              </div>
              <ul className="pagination toolbox-item">
                <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                  <a
                    className="page-link page-link-btn"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                  >
                    <i className="icon-angle-left"></i>
                  </a>
                </li>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <li
                      key={pageNum}
                      className={`page-item ${pageNum === page ? "active" : ""}`}
                    >
                      <a
                        className="page-link"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(pageNum);
                        }}
                      >
                        {pageNum}{" "}
                        {pageNum === page && (
                          <span className="sr-only">(current)</span>
                        )}
                      </a>
                    </li>
                  );
                })}
                <li
                  className={`page-item ${page >= totalPages ? "disabled" : ""}`}
                >
                  <a
                    className="page-link page-link-btn"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                  >
                    <i className="icon-angle-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          <aside
            className={`sidebar-shop col-lg-3 order-lg-first mobile-sidebar ${sidebarOpen ? "sidebar-opened" : ""}`}
          >
            <div className="sidebar-wrapper">
              <div className="widget">
                <h3 className="widget-title">
                  <a
                    data-toggle="collapse"
                    href="#widget-body-2"
                    role="button"
                    aria-expanded="true"
                    aria-controls="widget-body-2"
                  >
                    Categories
                  </a>
                </h3>
                <div className="collapse show" id="widget-body-2">
                  <div className="widget-body">
                    <ul className="cat-list">
                      <li>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedCategory("");
                            setPage(1);
                          }}
                        >
                          All
                        </a>
                      </li>
                      {categories.map((cat) => (
                        <li key={cat.id}>
                          <a
                            href="#"
                            className={
                              selectedCategory === cat.id ? "active" : ""
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedCategory(cat.id);
                              setPage(1);
                            }}
                          >
                            {cat.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="widget widget-price">
                <h3 className="widget-title">
                  <a
                    data-toggle="collapse"
                    href="#widget-body-3"
                    role="button"
                    aria-expanded="true"
                    aria-controls="widget-body-3"
                  >
                    Filter By Price
                  </a>
                </h3>
                <div className="collapse show" id="widget-body-3">
                  <div className="widget-body">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setPage(1);
                      }}
                    >
                      <div className="price-slider-wrapper">
                        <div id="price-slider" />
                      </div>
                      <div className="filter-price-action d-flex align-items-center justify-content-between flex-wrap pb-0">
                        <div className="filter-price-text mb-1 mb-xl-0">
                          Price:{" "}
                          <span id="filter-price-range" className="mr-3">
                            ${minPrice} - ${maxPrice}
                          </span>
                        </div>
                        <div className="d-flex gap-2 mb-2">
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => {
                              setMinPrice(
                                Math.max(0, Number(e.target.value) || 0),
                              );
                              setPage(1);
                            }}
                            min={0}
                          />
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => {
                              setMaxPrice(
                                Math.min(10000, Number(e.target.value) || 1000),
                              );
                              setPage(1);
                            }}
                            min={0}
                            max={10000}
                          />
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary font2 mb-1 mb-xl-0"
                        >
                          Filter
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="widget widget-size">
                <h3 className="widget-title">
                  <a
                    data-toggle="collapse"
                    href="#widget-body-5"
                    role="button"
                    aria-expanded="true"
                    aria-controls="widget-body-5"
                  >
                    Sizes
                  </a>
                </h3>
                <div className="collapse show" id="widget-body-5">
                  <div className="widget-body">
                    <ul className="cat-list">
                      {["L", "M", "S", "X"].map((size) => (
                        <li key={size}>
                          <a
                            href="#"
                            className={
                              selectedSizes.includes(size) ? "active" : ""
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedSizes((prev) =>
                                prev.includes(size)
                                  ? prev.filter((s) => s !== size)
                                  : [...prev, size],
                              );
                              setPage(1);
                            }}
                          >
                            {size}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="widget widget-color">
                <h3 className="widget-title">
                  <a
                    data-toggle="collapse"
                    href="#widget-body-6"
                    role="button"
                    aria-expanded="true"
                    aria-controls="widget-body-6"
                  >
                    Color
                  </a>
                </h3>
                <div className="collapse show" id="widget-body-6">
                  <div className="widget-body">
                    <ul className="config-swatch-list flex-column">
                      {[
                        { name: "Indigo", color: "#6085a5" },
                        { name: "Black", color: "#333" },
                        { name: "Blue", color: "#0188cc" },
                      ].map((color) => (
                        <li key={color.name}>
                          <a
                            href="#"
                            className={
                              selectedColors.includes(color.name)
                                ? "active"
                                : ""
                            }
                            style={{ backgroundColor: color.color }}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedColors((prev) =>
                                prev.includes(color.name)
                                  ? prev.filter((c) => c !== color.name)
                                  : [...prev, color.name],
                              );
                              setPage(1);
                            }}
                            title={color.name}
                          >
                            <span />
                          </a>
                          <span>{color.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
