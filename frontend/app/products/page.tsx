"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Product } from "@/types";
import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { Category } from "@/types";
import { useWishlist } from "@/lib/store/wishlist-store";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { fetchWishlist } = useWishlist();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Read search query from URL params on mount
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery(''); // Clear search query when no search param in URL
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const cats = await categoriesApi.getCategories();
        setCategories(cats);

        // Fetch products
        const sortMap: Record<string, { sortBy?: string; sortOrder?: 'asc' | 'desc' }> = {
          default: {},
          popularity: { sortBy: 'averageRating', sortOrder: 'desc' },
          rating: { sortBy: 'averageRating', sortOrder: 'desc' },
          date: { sortBy: 'createdAt', sortOrder: 'desc' },
          price: { sortBy: 'price', sortOrder: 'asc' },
          'price-desc': { sortBy: 'price', sortOrder: 'desc' },
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

        setProducts(response.products);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sortBy, selectedCategory, searchQuery, page, itemsPerPage, minPrice, maxPrice]);

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
                  {categories.find(c => c.id === selectedCategory)?.name || 'Category'}
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
            <h2 className="mb-2">
              Search Results for "{searchQuery}"
            </h2>
            <p className="text-muted">
              {loading ? 'Searching...' : `Found ${products.length} product${products.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        )}

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
                className={`layout-btn btn-grid ${viewMode === 'grid' ? 'active' : ''}`}
                title="Grid"
                onClick={(e) => {
                  e.preventDefault();
                  setViewMode('grid');
                }}
              >
                <i className="icon-mode-grid"></i>
              </a>
              <a 
                href="#" 
                className={`layout-btn btn-list ${viewMode === 'list' ? 'active' : ''}`}
                title="List"
                onClick={(e) => {
                  e.preventDefault();
                  setViewMode('list');
                }}
              >
                <i className="icon-mode-list"></i>
              </a>
            </div>
          </div>
        </nav>

        <div className="row">
          <aside
            className={`sidebar-shop sidebar-fixed sidebar-toggle sidebar-${sidebarOpen ? 'opened' : 'closed'}`}
          >
            <div className="sidebar-content-wrapper">
              <div className="sidebar-content">
                <div className="widget widget-clean">
                  <label>
                    <i className="icon-close"></i>Filters
                  </label>
                  <a
                    href="#"
                    className="sidebar-toggle-clean"
                    onClick={(e) => {
                      e.preventDefault();
                      setMinPrice(0);
                      setMaxPrice(1000);
                      setSelectedSizes([]);
                      setSelectedColors([]);
                      setPage(1);
                    }}
                  >
                    Clean All
                  </a>
                </div>

                <div className="widget">
                  <h3 className="widget-title">Filter by Price</h3>
                  <div className="widget-body">
                    <div className="price-slider-wrapper">
                      <div className="filter-price-action d-flex align-items-center justify-content-between flex-wrap">
                        <div className="filter-price-text">
                          <span>${minPrice} - ${maxPrice}</span>
                        </div>
                      </div>
                      <div className="d-flex gap-2 mb-2">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            setMinPrice(val);
                            setPage(1);
                          }}
                          min="0"
                        />
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => {
                            const val = Math.min(10000, Number(e.target.value) || 1000);
                            setMaxPrice(val);
                            setPage(1);
                          }}
                          min="0"
                          max="10000"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="widget">
                  <h3 className="widget-title">Size</h3>
                  <div className="widget-body">
                    <ul className="cat-list">
                      {['Small', 'Medium', 'Large', 'Extra Large'].map((size) => (
                        <li key={size}>
                          <a
                            href="#"
                            className={selectedSizes.includes(size) ? 'active' : ''}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedSizes((prev) =>
                                prev.includes(size)
                                  ? prev.filter((s) => s !== size)
                                  : [...prev, size]
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

                <div className="widget">
                  <h3 className="widget-title">Color</h3>
                  <div className="widget-body">
                    <ul className="config-swatch-list">
                      {[
                        { name: 'White', color: '#fff' },
                        { name: 'Black', color: '#000' },
                        { name: 'Red', color: '#ff0000' },
                        { name: 'Blue', color: '#0000ff' },
                      ].map((color) => (
                        <li key={color.name}>
                          <a
                            href="#"
                            className={`swatch ${selectedColors.includes(color.name) ? 'active' : ''}`}
                            style={{ backgroundColor: color.color }}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedColors((prev) =>
                                prev.includes(color.name)
                                  ? prev.filter((c) => c !== color.name)
                                  : [...prev, color.name]
                              );
                              setPage(1);
                            }}
                            title={color.name}
                          >
                            <span></span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className={`col-lg-12 col-xl-12 ${sidebarOpen ? 'col-lg-9 col-xl-9' : ''}`}>
            {loading ? (
              <div className="text-center py-5">
                <p>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-5">
                <p>No products found.</p>
              </div>
            ) : (
              <ProductGrid products={products} columns={viewMode === 'grid' ? 6 : 1} viewMode={viewMode} />
            )}

            <nav className="toolbox toolbox-pagination">
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

              <ul className="pagination">
                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
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
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <li key={pageNum} className={`page-item ${pageNum === page ? 'active' : ''}`}>
                      <a
                        className="page-link"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(pageNum);
                        }}
                      >
                        {pageNum} {pageNum === page && <span className="sr-only">(current)</span>}
                      </a>
                    </li>
                  );
                })}
                <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
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
        </div>
      </div>
    </main>
  );
}
