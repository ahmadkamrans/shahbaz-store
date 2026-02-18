"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HomeBanner } from "@/components/banners/HomeBanner";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { Product } from "@/types";

// Demo products data
const kitchenProducts: Product[] = [
  {
    id: "1",
    name: "Kitchen Wooden Chair",
    slug: "kitchen-wooden-chair",
    price: 49.0,
    oldPrice: 59.0,
    image: "/assets/images/demoes/demo29/products/grey/dining/dining(5).jpg",
    category: "Category",
    rating: 4,
  },
  {
    id: "2",
    name: "Sieve",
    slug: "sieve",
    price: 49.0,
    oldPrice: 59.0,
    image: "/assets/images/demoes/demo29/products/grey/kitchen/kitchen(1).jpg",
    category: "Category",
    rating: 4,
  },
  {
    id: "3",
    name: "Blue Pillow",
    slug: "blue-pillow",
    price: 49.0,
    oldPrice: 59.0,
    image: "/assets/images/demoes/demo29/products/grey/living/living(2).jpg",
    category: "Category",
    rating: 4,
  },
  {
    id: "4",
    name: "Trellis",
    slug: "trellis",
    price: 49.0,
    oldPrice: 59.0,
    image: "/assets/images/demoes/demo29/products/grey/outdoor/outdoor(5).jpg",
    category: "Category",
    rating: 4,
  },
  {
    id: "5",
    name: "Dinner Table",
    slug: "dinner-table",
    price: 49.0,
    oldPrice: 59.0,
    image: "/assets/images/demoes/demo29/products/grey/dining/dining(4).jpg",
    category: "Category",
    rating: 4,
  },
];

const allProducts: Product[] = [
  {
    id: "6",
    name: "Product Short Name",
    slug: "product-1",
    price: 49.0,
    image: "/assets/images/demoes/demo29/products/grey/bedroom/bedroom(1).jpg",
    category: "category",
    rating: 5,
  },
  {
    id: "7",
    name: "Wooden Arm Chair",
    slug: "wooden-arm-chair",
    price: 49.0,
    image: "/assets/images/demoes/demo29/products/grey/outdoor/outdoor(2).jpg",
    category: "category",
    rating: 5,
  },
  {
    id: "8",
    name: "Bureau",
    slug: "bureau",
    price: 49.0,
    image: "/assets/images/demoes/demo29/products/grey/bedroom/bedroom(3).jpg",
    category: "category",
    rating: 5,
  },
  {
    id: "9",
    name: "Sleepwear",
    slug: "sleepwear",
    price: 49.0,
    image: "/assets/images/demoes/demo29/products/grey/bedroom/bedroom(4).jpg",
    category: "category",
    rating: 5,
  },
  {
    id: "10",
    name: "Clothes Chest",
    slug: "clothes-chest",
    price: 49.0,
    image: "/assets/images/demoes/demo29/products/grey/bedroom/bedroom(5).jpg",
    category: "category",
    rating: 5,
  },
  {
    id: "11",
    name: "Drawer",
    slug: "drawer",
    price: 49.0,
    image: "/assets/images/demoes/demo29/products/grey/dining/dining(1).jpg",
    category: "category",
    rating: 5,
  },
  {
    id: "12",
    name: "Product Short Name",
    slug: "product-2",
    price: 49.0,
    image: "/assets/images/demoes/demo29/products/grey/kitchen/kitchen(2).jpg",
    category: "category",
    rating: 5,
  },
  {
    id: "13",
    name: "Product Short Name",
    slug: "product-3",
    price: 49.0,
    image: "/assets/images/demoes/demo29/products/grey/office/office(4).jpg",
    category: "category",
    rating: 5,
  },
  {
    id: "14",
    name: "Product Short Name",
    slug: "product-4",
    price: 49.0,
    image: "/assets/images/demoes/demo29/products/grey/kitchen/kitchen(7).jpg",
    category: "category",
    rating: 5,
  },
  {
    id: "15",
    name: "Sieve",
    slug: "sieve-2",
    price: 49.0,
    image: "/assets/images/demoes/demo29/products/grey/kitchen/kitchen(1).jpg",
    category: "category",
    rating: 5,
  },
  {
    id: "16",
    name: "Dinner Table",
    slug: "dinner-table-2",
    price: 49.0,
    image: "/assets/images/demoes/demo29/products/grey/dining/dining(4).jpg",
    category: "category",
    rating: 5,
  },
  {
    id: "17",
    name: "Wooden Box",
    slug: "wooden-box",
    price: 49.0,
    image: "/assets/images/demoes/demo29/products/grey/outdoor/outdoor(4).jpg",
    category: "category",
    rating: 5,
  },
];

const tabs = ["kitchen", "dining", "bedroom", "living", "office", "outdoor"];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("kitchen");

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
                price="starting from $399"
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
                      <span>$100</span>off
                    </h3>
                    <p className="font2">starting from $199</p>
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
                    Free shipping on all orders over $99.
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
                  <p className="text-body">Lorem ipsum dolor sit amet.</p>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-xl-3 mb-2 mb-xl-0">
              <div className="info-box info-box-icon-left justify-content-sm-center justify-content-start p-0">
                <i className="icon-secure-payment line-height-1"></i>
                <div className="info-box-content">
                  <h4 className="ls-25 line-height-1">SECURE PAYMENT</h4>
                  <p className="text-body">Lorem ipsum dolor sit amet.</p>
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
                    {tab}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="tab-content">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`tab-pane fade ${
                  activeTab === tab ? "show active" : ""
                }`}
              >
                <ProductCarousel products={kitchenProducts} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section
        className="banner-section home-banner mb-6 appear-animate"
        style={{
          backgroundImage:
            "url('/assets/images/demoes/demo29/banners/banner-bathroom.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="banner-content full-content d-flex flex-lg-row flex-column align-items-center mt-1 mt-lg-0">
          <div className="left-content">
            <div>
              <span className="font1">it is time for a</span>
              <h4>Modern Bathroom</h4>
            </div>
            <Link href="/products" className="btn">
              Show Now <i className="fas fa-long-arrow-alt-right"></i>
            </Link>
          </div>
          <div className="right-content banner-info">
            <a href="#" className="btn skew-box bg-white">
              Exclusive COUPON
            </a>
            <h3 className="sale-off skew-box">
              <span className="text-white">$200</span>off
            </h3>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="featured-section bg-white appear-animate">
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
                            // Handle add to cart
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
                          // Handle quick view
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
                        <Link
                          href="/wishlist"
                          title="Wishlist"
                          className="btn-icon-wish"
                        >
                          <i className="icon-heart"></i>
                        </Link>
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
                            style={{ width: `${(product.rating || 0) * 20}%` }}
                          ></span>
                          <span className="tooltiptext tooltip-top"></span>
                        </div>
                      </div>
                      <div className="price-box">
                        <span className="product-price">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/products" className="btn with-icon align-center font2">
              Browse All<i className="fas fa-long-arrow-alt-right"></i>
            </Link>
          </div>

          <hr />

          <div className="blog-section container mb-4 appear-animate">
            <div className="row">
              <div className="col-xl-6 mb-3 mb-xl-0">
                <div className="section-title d-flex align-items-center mt-1 mb-1">
                  <h2 className="mb-0">RECENT ARTICLE</h2>
                  <hr className="vertical d-none d-sm-block" />
                  <Link
                    href="/blog"
                    className="with-icon mr-sm-auto ml-4 mr-4 ml-sm-0"
                  >
                    VIEW BLOG<i className="fas fa-long-arrow-alt-right"></i>
                  </Link>
                </div>

                <div className="row post">
                  <div className="col-md-6">
                    <div className="post-media">
                      <Link href="/blog/1">
                        <Image
                          src="/assets/images/demoes/demo29/banners/banner-article.jpg"
                          width={396}
                          height={297}
                          alt="Post"
                        />
                      </Link>
                      <div className="post-date">
                        <span className="day ls-0">24</span>
                        <span className="month">JUL-19</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 d-flex align-items-center">
                    <div className="post-body">
                      <a href="#" className="post-category">
                        DESIGN TRENDS
                      </a>
                      <h3 className="post-title">
                        Top quality flooring and parquets
                      </h3>
                      <p className="mb-2">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Cras non placerat mi. Etiam non tellus sem. Aenean
                        pretium convallis lorem, sit amet dapibus...
                      </p>
                      <Link href="/blog/1" className="btn with-icon">
                        READ MORE
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-6">
                <div className="section-title d-flex align-items-center mt-1 mb-1">
                  <h2 className="mb-0">FROM INSTAGRAM</h2>
                  <hr className="vertical d-none d-sm-block" />
                  <a
                    href="#"
                    className="with-icon mr-sm-auto ml-4 mr-4 ml-sm-0"
                  >
                    @SHAHBAZ<i className="fas fa-long-arrow-alt-right"></i>
                  </a>
                </div>
                <div className="row row-sm">
                  <div className="col-sm-4 mt-2 mb-2">
                    <Image
                      className="w-100"
                      src="/assets/images/demoes/demo29/instagram/instagram1.jpg"
                      width={263}
                      height={263}
                      alt="Instagram"
                    />
                  </div>
                  <div className="col-sm-4 mt-2 mb-2">
                    <Image
                      className="w-100"
                      src="/assets/images/demoes/demo29/instagram/instagram2.jpg"
                      width={263}
                      height={263}
                      alt="Instagram"
                    />
                  </div>
                  <div className="col-sm-4 mt-2 mb-2">
                    <Image
                      className="w-100"
                      src="/assets/images/demoes/demo29/instagram/instagram3.jpg"
                      width={263}
                      height={263}
                      alt="Instagram"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
