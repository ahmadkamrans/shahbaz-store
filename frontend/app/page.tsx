"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { HomeBanner } from "@/components/banners/HomeBanner";
import { PromotionCarousel } from "@/components/banners/PromotionCarousel";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { ProductCollections } from "@/components/product/ProductCollections";
import { Product } from "@/types";
import { productsApi } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { Category } from "@/types";
import { useWishlist } from "@/lib/store/wishlist-store";
import { useCart } from "@/lib/store/cart-store";
import { useSiteLoading } from "@/lib/loading-context";
import { formatCurrency } from "@/lib/utils/currency";
import { settingsApi, Settings } from "@/lib/api/settings";

export default function HomePage() {
  const {
    addItem: addToWishlist,
    removeItem,
    isInWishlist,
    fetchWishlist,
  } = useWishlist();
  const { addItem: addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const { setLoading: setSiteLoading } = useSiteLoading();
  const [activeTab, setActiveTab] = useState<string>("");
  const [featuredProducts, setFeaturedProducts] = useState<
    Record<string, Product[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [categoryIdsByTab, setCategoryIdsByTab] = useState<
    Record<string, string>
  >({});
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );
  const [settings, setSettings] = useState<Settings | null>(null);

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

  // Fetch wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Fetch settings to check banner status
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const siteSettings = await settingsApi.get();
        setSettings(siteSettings);
      } catch (error) {
        console.error("Error fetching settings:", error);
        setSettings(null);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setSiteLoading(true);

        // Fetch categories dynamically
        const fetchedCategories = await categoriesApi.getCategories();
        // Filter only top-level categories (no parent)
        const topLevelCategories = fetchedCategories.filter(
          (cat) => !cat.parentId,
        );
        setCategories(topLevelCategories);

        // Set first category as active tab
        if (topLevelCategories.length > 0) {
          const firstCategorySlug =
            topLevelCategories[0].slug || topLevelCategories[0].id;
          setActiveTab(firstCategorySlug);
        }

        // Fetch products for each category
        const productsByCategory: Record<string, Product[]> = {};
        const categoryIdsByTab: Record<string, string> = {};

        for (const category of topLevelCategories) {
          const tabKey = category.slug || category.id;

          try {
            // Get products from this category
            const result = await productsApi.getProducts({
              category: category.id,
              limit: 20,
            });

            productsByCategory[tabKey] = result.products || [];
            categoryIdsByTab[tabKey] = category.id;
          } catch (error) {
            console.error(
              `Failed to fetch products for ${category.name}:`,
              error,
            );
            productsByCategory[tabKey] = [];
          }
        }

        setFeaturedProducts(productsByCategory);
        setCategoryIdsByTab(categoryIdsByTab);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
        setSiteLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className={`home main ${!settings?.banner?.isActive ? "mt-10" : ""}`}>
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

        <PromotionCarousel heading="Special Promotions" />

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
          <div
            className="heading d-flex align-items-center justify-content-center mt-5 mb-5"
            style={{ overflowX: "auto", width: "100%" }}
          >
            <ul
              className="nav product-filter-items mb-0"
              style={{
                display: "flex",
                flexWrap: "nowrap",
                gap: "1.5rem",
                padding: "0 1rem",
                maxWidth: "100%",
              }}
            >
              {categories.map((category) => {
                const tabKey = category.slug || category.id;
                return (
                  <li
                    key={category.id}
                    className="nav-item product-filter-item"
                    style={{ flexShrink: 0 }}
                  >
                    <a
                      href="#"
                      className={`nav-link ${activeTab === tabKey ? "active" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab(tabKey);
                      }}
                      style={{
                        cursor: "pointer",
                        userSelect: "none",
                        fontSize: "2rem",
                        fontWeight: "600",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {category.name.toUpperCase()}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="tab-content">
            {loading ? (
              <div className="text-center py-5">
                <p>Loading products...</p>
              </div>
            ) : (
              categories.map((category) => {
                const tabKey = category.slug || category.id;
                const products = featuredProducts[tabKey] || [];
                const categoryId = categoryIdsByTab[tabKey];
                return (
                  <div
                    key={category.id}
                    className={`tab-pane fade ${
                      activeTab === tabKey ? "show active" : ""
                    }`}
                  >
                    {products.length > 0 ? (
                      <>
                        <ProductCarousel products={products} />
                        {categoryId && (
                          <Link
                            href={`/products?category=${categoryId}`}
                            className="btn with-icon align-center font2"
                          >
                            Browse All
                            <i className="fas fa-long-arrow-alt-right"></i>
                          </Link>
                        )}
                      </>
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

      <ProductCollections categoryId={categoryIdsByTab[activeTab]} />

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </main>
  );
}
