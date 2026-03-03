"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReactSlider from "react-slider";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductCollections } from "@/components/product/ProductCollections";
import { Product } from "@/types";
import { productsApi } from "@/lib/api/products";
import { formatPrice } from "@/lib/utils";
import { categoriesApi } from "@/lib/api/categories";
import { Category } from "@/types";
import { useWishlist } from "@/lib/store/wishlist-store";
import { useSiteLoading } from "@/lib/loading-context";
import { ProductsFilterMenu } from "@/components/layout/ProductsFilterMenu";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const { fetchWishlist } = useWishlist();
  const { setLoading: setSiteLoading } = useSiteLoading();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState("menu_order");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiFailed, setApiFailed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [topLevelCategories, setTopLevelCategories] = useState<Category[]>([]);
  const [categoryChildren, setCategoryChildren] = useState<Record<string, Category[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [randomCategoryId, setRandomCategoryId] = useState<string | null>(null);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [priceFilterExpanded, setPriceFilterExpanded] = useState(true);

  // Fetch wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Read search and category query params from URL on mount and when they change
  useEffect(() => {
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    // If category is in URL, set it and clear search
    if (category) {
      setSelectedCategory(category);
      setSearchQuery(""); // Clear search when category is selected
    } else {
      setSelectedCategory(""); // Clear category when not in URL
    }

    // If search is in URL (and no category), set it
    if (search && !category) {
      setSearchQuery(search);
    } else if (!search) {
      setSearchQuery(""); // Clear search query when no search param in URL
    }
  }, [searchParams]);

  // Fetch top-level categories on mount
  useEffect(() => {
    const fetchTopLevelCategories = async () => {
      try {
        console.log("Fetching top-level categories...");
        const cats = await categoriesApi.getCategories(null);
        console.log("Categories received:", cats);
        const categoriesArray = Array.isArray(cats) ? cats : [];
        console.log("Setting topLevelCategories:", categoriesArray);
        setTopLevelCategories(categoriesArray);
        
        // Get random category for collections when no category is selected
        if (categoriesArray.length > 0) {
          const randomIndex = Math.floor(Math.random() * categoriesArray.length);
          setRandomCategoryId(categoriesArray[randomIndex].id);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setTopLevelCategories([]);
      }
    };
    fetchTopLevelCategories();
  }, []);

  // Debug: Log when topLevelCategories changes
  useEffect(() => {
    console.log("topLevelCategories state updated:", topLevelCategories);
  }, [topLevelCategories]);

  // Recursively fetch all sub-categories at any depth
  const fetchAllSubCategories = async (
    categoryId: string,
    processingIds: Set<string> = new Set(),
    addedIds: Map<string, Category> = new Map(),
    rootCategoryId: string
  ): Promise<Category[]> => {
    try {
      // Prevent infinite loops
      if (processingIds.has(categoryId)) {
        return [];
      }
      processingIds.add(categoryId);

      const directSubCats = await categoriesApi.getCategories(categoryId).catch(() => []);
      
      if (!Array.isArray(directSubCats)) {
        return [];
      }
      
      // Process direct sub-categories
      for (const cat of directSubCats) {
        // Skip root category and already added categories
        if (cat.id !== rootCategoryId && !addedIds.has(cat.id)) {
          addedIds.set(cat.id, cat);
          
          // Recursively fetch sub-categories of this category
          await fetchAllSubCategories(cat.id, processingIds, addedIds, rootCategoryId);
        }
      }
      
      // Return all unique categories as an array
      return Array.from(addedIds.values());
    } catch (error) {
      console.error(`Failed to fetch sub-categories for ${categoryId}:`, error);
      return [];
    }
  };

  // Fetch sub-categories when a category is expanded (recursive support)
  const fetchSubCategories = async (categoryId: string) => {
    if (categoryChildren[categoryId]) {
      // Already fetched
      return;
    }
    try {
      const allSubCats = await fetchAllSubCategories(categoryId, new Set(), new Map(), categoryId);
      // Use Map to ensure absolute uniqueness, then convert to array
      const uniqueMap = new Map<string, Category>();
      for (const cat of allSubCats) {
        if (!uniqueMap.has(cat.id)) {
          uniqueMap.set(cat.id, cat);
        }
      }
      const uniqueSubCats = Array.from(uniqueMap.values());
      
      setCategoryChildren((prev) => ({
        ...prev,
        [categoryId]: uniqueSubCats,
      }));
    } catch (error) {
      console.error(`Failed to fetch sub-categories for ${categoryId}:`, error);
    }
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
      fetchSubCategories(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Category item component - all sub-categories shown at same level
  const CategoryItem = ({ category, onSelect }: { category: Category; onSelect?: () => void }) => {
    const subCategories = categoryChildren[category.id] || [];
    const hasChildren = subCategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const hasCheckedForChildren = categoryChildren.hasOwnProperty(category.id);

    return (
      <li>
        <div className="d-flex align-items-center">
          <button
            type="button"
            className="category-toggle me-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleCategory(category.id);
            }}
            style={{
              background: "none",
              border: "none",
              padding: "0",
              cursor: "pointer",
              fontSize: "12px",
              width: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: hasCheckedForChildren && !hasChildren ? 0.3 : 1,
            }}
            disabled={hasCheckedForChildren && !hasChildren}
          >
            <i className={`icon-angle-${isExpanded ? "down" : "right"}`}></i>
          </button>
          <a
            href="#"
            className={selectedCategory === category.id ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              // Always toggle expansion (will fetch children if not already fetched)
              // Skip toggle only if we've confirmed there are no children
              if (hasCheckedForChildren && !hasChildren) {
                setSelectedCategory(category.id);
                setSearchQuery("");
                setPage(1);
              } else {
                toggleCategory(category.id);
                setSelectedCategory(category.id);
                setSearchQuery("");
                setPage(1);
              }
              onSelect?.();
            }}
            style={{ flex: 1, cursor: "pointer" }}
          >
            {category.name}
          </a>
        </div>
        {isExpanded && hasChildren && (
          <ul className="cat-list" style={{ marginLeft: "20px", marginTop: "5px" }}>
            {subCategories
              .filter((subCat, index, self) => 
                index === self.findIndex((c) => c.id === subCat.id)
              )
              .map((subCat, index) => (
                <li key={`${category.id}-${subCat.id}-${index}`}>
                  <a
                    href="#"
                    className={selectedCategory === subCat.id ? "active" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedCategory(subCat.id);
                      setSearchQuery("");
                      setPage(1);
                      onSelect?.();
                    }}
                  >
                    {subCat.name}
                  </a>
                </li>
              ))}
          </ul>
        )}
      </li>
    );
  };

  // Reset page and products when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setProducts([]);
  }, [selectedCategory, searchQuery, sortBy, minPrice, maxPrice, itemsPerPage]);

  const renderFilterContent = (idSuffix: string, onCloseMenu?: () => void) => (
    <>
      <div className="widget">
        <h3 className="widget-title">
          <a
            href={`#widget-body-2${idSuffix}`}
            role="button"
            aria-expanded={categoriesExpanded}
            aria-controls={`widget-body-2${idSuffix}`}
            onClick={(e) => {
              e.preventDefault();
              setCategoriesExpanded(!categoriesExpanded);
            }}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", color: "inherit" }}
          >
            <span>Categories</span>
            <i className={`icon-${categoriesExpanded ? "minus" : "plus"}`} style={{ fontSize: "14px", color: "#000", fontWeight: "bold" }}></i>
          </a>
        </h3>
        <div className={`collapse ${categoriesExpanded ? "show" : ""}`} id={`widget-body-2${idSuffix}`}>
          <div className="widget-body">
            <ul className="cat-list">
              <li>
                <a
                  href="#"
                  className={selectedCategory === "" ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedCategory("");
                    setSearchQuery("");
                    setPage(1);
                    onCloseMenu?.();
                  }}
                >
                  All
                </a>
              </li>
              {topLevelCategories.length === 0 ? (
                <li>
                  <span style={{ color: "#999", fontStyle: "italic" }}>No categories available</span>
                </li>
              ) : (
                topLevelCategories.map((cat) => (
                  <CategoryItem key={cat.id} category={cat} onSelect={onCloseMenu} />
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="widget widget-price">
        <h3 className="widget-title">
          <a
            href={`#widget-body-3${idSuffix}`}
            role="button"
            aria-expanded={priceFilterExpanded}
            aria-controls={`widget-body-3${idSuffix}`}
            onClick={(e) => {
              e.preventDefault();
              setPriceFilterExpanded(!priceFilterExpanded);
            }}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", color: "inherit" }}
          >
            <span>Filter By Price</span>
            <i className={`icon-${priceFilterExpanded ? "minus" : "plus"}`} style={{ fontSize: "14px", color: "#000", fontWeight: "bold" }}></i>
          </a>
        </h3>
        <div className={`collapse ${priceFilterExpanded ? "show" : ""}`} id={`widget-body-3${idSuffix}`}>
          <div className="widget-body">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                onCloseMenu?.();
              }}
            >
              <div className="price-slider-wrapper" style={{ marginBottom: "15px" }}>
                <ReactSlider
                  className="price-range-slider"
                  thumbClassName="price-slider-thumb"
                  trackClassName="price-slider-track"
                  value={[minPrice, maxPrice]}
                  onChange={(values: number[]) => {
                    setMinPrice(values[0]);
                    setMaxPrice(values[1]);
                    setPage(1);
                  }}
                  min={0}
                  max={10000}
                  step={1}
                  pearling
                  minDistance={10}
                />
              </div>
              <div className="filter-price-action d-flex align-items-center justify-content-between flex-wrap pb-0">
                <div className="filter-price-text mb-1 mb-xl-0">
                  Price: <span className="mr-3">${minPrice} - ${maxPrice}</span>
                </div>
                <div className="d-flex gap-2 mb-2">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(Math.max(0, Number(e.target.value) || 0));
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
                      setMaxPrice(Math.min(10000, Number(e.target.value) || 1000));
                      setPage(1);
                    }}
                    min={0}
                    max={10000}
                  />
                </div>
                <button type="submit" className="btn btn-primary font2 mb-1 mb-xl-0">
                  Filter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only set main loading on first page or when filters change
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setApiFailed(false);

        const sortMap: Record<
          string,
          {
            sortBy?:
              | "createdAt"
              | "name"
              | "price"
              | "averageRating"
              | "viewCount";
            sortOrder?: "asc" | "desc";
          }
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
          maxPrice: maxPrice > 0 && maxPrice < 10000 ? maxPrice : undefined,
          ...sortParams,
        });

        const list = response?.products ?? [];
        
        if (page === 1) {
          // First page - replace products
          setProducts(list);
        } else {
          // Subsequent pages - append products
          setProducts(prev => [...prev, ...list]);
        }
        
        setTotalPages(response.totalPages ?? 1);
        setHasMore(page < (response.totalPages ?? 1));
        setApiFailed(list.length === 0 && page === 1);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        if (page === 1) {
          setProducts([]);
        }
        setTotalPages(1);
        setApiFailed(true);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
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

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .sidebar-shop .widget-title a:before,
        .sidebar-shop .widget-title a:after {
          content: none !important;
          display: none !important;
        }
        @media (min-width: 992px) {
          .main .sidebar-shop .sidebar-wrapper,
          .main .sidebar-shop .widget,
          .main .sidebar-shop .widget-body,
          .main .sidebar-shop .price-slider-wrapper {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
        }
      `}} />
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
                    {topLevelCategories.find((c) => c.id === selectedCategory)
                      ?.name ||
                      Object.values(categoryChildren)
                        .flat()
                        .find((c) => c.id === selectedCategory)?.name ||
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
          {/* Desktop sidebar: visible only on lg+ */}
          <aside className="sidebar-shop col-lg-2 order-lg-first d-none d-lg-block">
            <div className="sidebar-wrapper">
              {renderFilterContent("", undefined)}
            </div>
          </aside>

            <div className="col-lg-10">
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
                      <line
                        x1="6"
                        x2="9"
                        y1="9"
                        y2="9"
                        className="cls-1"
                      ></line>
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
                        <option value="price">
                          Sort by price: low to high
                        </option>
                        <option value="price-desc">
                          Sort by price: high to low
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

              <div className="toolbox-right">
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

            <div className="row products-body">
              {loading && products.length === 0 ? (
                <div className="col-12 text-center py-5">
                  <p>Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="col-12 text-center py-5">
                  <p>No products found.</p>
                </div>
              ) : (
                <>
                  <ProductGrid
                    products={products}
                    viewMode={viewMode}
                    columnClass="col-6 col-md-4 col-lg-3 col-xl-5col"
                  />
                  {/* Intersection observer target for infinite scroll */}
                  <div ref={observerTarget} style={{ height: '20px', width: '100%' }} />
                  {loadingMore && (
                    <div className="col-12 text-center py-3">
                      <p>Loading more products...</p>
                    </div>
                  )}
                  {!hasMore && products.length > 0 && (
                    <div className="col-12 text-center py-3">
                      <p className="text-muted">No more products to load.</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Pagination hidden - using infinite scroll instead */}
            <nav className="toolbox toolbox-pagination font2" style={{ display: 'none' }}>
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
        </div>

        <ProductsFilterMenu
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        >
          {renderFilterContent("-mobile", () => setSidebarOpen(false))}
        </ProductsFilterMenu>
      </div>

      <ProductCollections categoryId={selectedCategory || randomCategoryId || undefined} />
    </main>
    </>
  );
}

function ProductsPageFallback() {
  return (
    <main className="main">
      <div className="container py-5">
        <div className="text-center py-5">
          <p className="mb-0">Loading products...</p>
        </div>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsPageContent />
    </Suspense>
  );
}
