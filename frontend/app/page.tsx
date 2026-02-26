"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { HomeBanner } from "@/components/banners/HomeBanner";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { Product } from "@/types";
import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { useWishlist } from "@/lib/store/wishlist-store";
import { useCart } from "@/lib/store/cart-store";
import { formatCurrency } from "@/lib/utils/currency";

const tabs = ["kitchen", "dining", "bedroom", "living", "office", "outdoor"];

export default function HomePage() {
  const { addItem: addToWishlist, removeItem, isInWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const [activeTab, setActiveTab] = useState("kitchen");
  const [featuredProducts, setFeaturedProducts] = useState<
    Record<string, Product[]>
  >({});
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );

  const handleToggleWishlist = async (
    e: React.MouseEvent,
    product: Product,
  ) => {
    e.preventDefault();
    try {
      if (isInWishlist(product.id)) {
        await removeItem(product.id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      // Error is already handled in the store
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories to map tab names to category IDs
        const categories = await categoriesApi.getCategories();
        const map: Record<string, string> = {};

        // Create mapping from category names/slugs to IDs
        categories.forEach((category) => {
          const lowerName = category.name.toLowerCase().trim();
          const lowerSlug = (category.slug || "").toLowerCase().trim();
          map[lowerName] = category.id;
          if (lowerSlug) {
            map[lowerSlug] = category.id;
          }
        });

        setCategoryMap(map);

        // Fetch products for each category tab
        const productsByCategory: Record<string, Product[]> = {};

        for (const tab of tabs) {
          const categoryId = map[tab];

          if (categoryId) {
            try {
              // Get products from this category
              const result = await productsApi.getProducts({
                category: categoryId,
                limit: 5,
              });

              productsByCategory[tab] = result.products || [];
            } catch (error) {
              console.error(`Failed to fetch products for ${tab}:`, error);
              productsByCategory[tab] = [];
            }
          } else {
            // If no category found, try to find by name match
            const matchedCategory = categories.find(
              (cat) => cat.name.toLowerCase().trim() === tab,
            );
            if (matchedCategory) {
              try {
                const result = await productsApi.getProducts({
                  category: matchedCategory.id,
                  limit: 5,
                });
                productsByCategory[tab] = result.products || [];
              } catch (error) {
                console.error(
                  `Failed to fetch products for ${tab} (fallback):`,
                  error,
                );
                productsByCategory[tab] = [];
              }
            } else {
              productsByCategory[tab] = [];
            }
          }
        }

        setFeaturedProducts(productsByCategory);

        // Fetch all products for grid
        const all = await productsApi.getProducts({
          limit: 12,
        });
        setAllProducts(all.products);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="home main">
      <div className="container">
        <section>
          <div className="row grid">
            <div className="grid-item col-lg-5 height-x1">
              <HomeBanner
                image="/assets/images/demoes/demo29/banners/home-banner1.jpg"
                imageWidth={674}
                imageHeight={316}
                title="black<br />Armchairs"
                price="starting from Rs 399"
                link="/products"
                linkText="shop now"
                position="right"
                titleClass="ls-10"
              />
            </div>
            <div className="grid-item col-lg-7 height-x2">
              <div className="home-banner">
                <figure className="bg-gray">
                  <Image
                    src="/assets/images/demoes/demo29/banners/home-banner2.jpg"
                    width={951}
                    height={651}
                    alt="banner"
                  />
                </figure>
                <div className="banner-content content-left">
                  <h3>
                    <strong>
                      wooden
                      <br />
                    </strong>
                    Black Chair
                  </h3>
                  <div className="banner-info">
                    <a href="#" className="btn skew-box">
                      go coupon
                    </a>
                    <h3 className="sale-off skew-box">
                      <span>Rs 100</span>off
                    </h3>
                    <p className="font2">starting from Rs 199</p>
                    <Link href="/products" className="btn">
                      shop now <i className="fas fa-long-arrow-alt-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid-item col-6 col-lg-2 height-x1">
              <HomeBanner
                image="/assets/images/demoes/demo29/banners/home-banner3.jpg"
                imageWidth={257}
                imageHeight={315}
                subtitle="check new arrivals"
                title="<strong>cool lamps</strong>"
                position="top"
                className="bg-dark"
                useH4={true}
              />
            </div>
            <div className="grid-item col-6 col-lg-3 height-x1">
              <HomeBanner
                image="/assets/images/demoes/demo29/banners/home-banner4.jpg"
                imageWidth={396}
                imageHeight={315}
                subtitle="exclusive new collection"
                title="<strong>luxurious jacuzzi</strong>"
                position="bottom"
                className="bg-primary"
                useH4={true}
              />
            </div>
            <div className="col-1 pr-0 pl-0 grid-col-sizer"></div>
          </div>
        </section>

        <section className="info-box-container mb-0 appear-animate">
          <div className="row">
            <div className="col-sm-6 col-xl-3 mb-2 mb-xl-0">
              <div className="info-box info-box-icon-left justify-content-sm-center justify-content-start p-0">
                <i className="icon-shipping line-height-1"></i>
                <div className="info-box-content">
                  <h4 className="ls-25 line-height-1">
                    FREE SHIPPING &amp; RETURN
                  </h4>
                  <p className="text-body">
                    Free shipping on all orders over Rs 99.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-3 mb-2 mb-xl-0">
              <div className="info-box info-box-icon-left justify-content-sm-center justify-content-start p-0">
                <i className="icon-money line-height-1"></i>
                <div className="info-box-content">
                  <h4 className="ls-25 line-height-1">MONEY BACK GUARANTEE</h4>
                  <p className="text-body">100% money back guarantee.</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-3 mb-2 mb-xl-0">
              <div className="info-box info-box-icon-left justify-content-sm-center justify-content-start p-0">
                <i className="icon-support line-height-1"></i>
                <div className="info-box-content">
                  <h4 className="ls-25 line-height-1">ONLINE SUPPORT 24/7</h4>
                  <p className="text-body"> We are always here to help you.</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-3 mb-2 mb-xl-0">
              <div className="info-box info-box-icon-left justify-content-sm-center justify-content-start p-0">
                <i className="icon-secure-payment line-height-1"></i>
                <div className="info-box-content">
                  <h4 className="ls-25 line-height-1">Cash on Delivery</h4>
                  <p className="text-body"> We accept cash on delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="mt-0" />

        <section className="featured-section product-slider-tab appear-animate">
          <div className="heading d-flex align-items-center flex-column flex-lg-row">
            <div className="section-title">
              <h2 className="mt-1 mb-1">FEATURED PRODUCTS</h2>
            </div>
            <ul className="nav product-filter-items ml-lg-auto justify-content-center mb-0">
              {tabs.map((tab) => (
                <li key={tab} className="nav-item product-filter-item">
                  <a
                    className={`nav-link ${activeTab === tab ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab(tab);
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1).toUpperCase()}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="tab-content">
            {loading ? (
              <div className="text-center py-5">
                <p>Loading products...</p>
              </div>
            ) : (
              tabs.map((tab) => {
                const products = featuredProducts[tab] || [];
                return (
                  <div
                    key={tab}
                    className={`tab-pane fade ${
                      activeTab === tab ? "show active" : ""
                    }`}
                  >
                    {products.length > 0 ? (
                      <ProductCarousel products={products} />
                    ) : (
                      <div className="text-center py-5">
                        <p>No featured products available for this category.</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <section>
        <div className="container">
          <div className="featured-section bg-white appear-animate">
            {loading ? (
              <div className="text-center py-5">
                <p>Loading products...</p>
              </div>
            ) : (
              <div className="row">
                {allProducts.map((product) => (
                  <div
                    key={product.id}
                    className="col-6 col-md-4 col-lg-3 col-xl-2"
                  >
                    <div className="product-default inner-quickview inner-icon">
                      <figure>
                        <Link href={`/product/${product.slug}`}>
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={257}
                            height={257}
                          />
                        </Link>
                        <div className="btn-icon-group">
                          <a
                            href="#"
                            className="btn-icon btn-add-cart product-type-simple"
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart(product);
                            }}
                          >
                            <i className="icon-shopping-cart"></i>
                          </a>
                        </div>
                        <a
                          href="#"
                          className="btn-quickview"
                          title="Quick View"
                          onClick={(e) => {
                            e.preventDefault();
                            setQuickViewProduct(product);
                          }}
                        >
                          Quick View
                        </a>
                      </figure>
                      <div className="product-details">
                        <div className="category-wrap">
                          <div className="category-list">
                            <Link href="/products" className="product-category">
                              {product.category}
                            </Link>
                          </div>
                          <a
                            href="#"
                            title={
                              isInWishlist(product.id)
                                ? "Remove from Wishlist"
                                : "Add to Wishlist"
                            }
                            className={`btn-icon-wish ${isInWishlist(product.id) ? "added-wishlist" : ""}`}
                            onClick={(e) => handleToggleWishlist(e, product)}
                          >
                            <i className="icon-heart"></i>
                          </a>
                        </div>
                        <h3 className="product-title">
                          <Link href={`/product/${product.slug}`}>
                            {product.name}
                          </Link>
                        </h3>
                        <div className="ratings-container">
                          <div className="product-ratings">
                            <span
                              className="ratings"
                              style={{
                                width: `${(product.rating || 0) * 20}%`,
                              }}
                            ></span>
                            <span className="tooltiptext tooltip-top"></span>
                          </div>
                        </div>
                        <div className="price-box">
                          <span className="product-price">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/products" className="btn with-icon align-center font2">
              Browse All<i className="fas fa-long-arrow-alt-right"></i>
            </Link>
          </div>

          <hr />
        </div>
      </section>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </main>
  );
}
