'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/lib/store/cart-store';

// Demo product data
const product: Product = {
  id: '1',
  name: 'Men Black Sports Shoes',
  slug: 'men-black-sports-shoes',
  price: 70.0,
  oldPrice: 90.0,
  image: '/assets/images/products/zoom/product-1-big.jpg',
  images: [
    '/assets/images/products/zoom/product-1-big.jpg',
    '/assets/images/products/zoom/product-2-big.jpg',
    '/assets/images/products/zoom/product-3-big.jpg',
    '/assets/images/products/zoom/product-4-big.jpg',
    '/assets/images/products/zoom/product-5-big.jpg',
  ],
  category: 'Shoes',
  rating: 4.5,
  description: 'Product description here...',
  inStock: true,
  sku: 'SKU-001',
};

const thumbnails = [
  '/assets/images/products/zoom/product-1.jpg',
  '/assets/images/products/zoom/product-2.jpg',
  '/assets/images/products/zoom/product-3.jpg',
  '/assets/images/products/zoom/product-4.jpg',
  '/assets/images/products/zoom/product-5.jpg',
];

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <main className="main">
      <div className="container">
        <nav aria-label="breadcrumb" className="breadcrumb-nav">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">
                <i className="icon-home"></i>
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/products">Products</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="product-single-container product-single-default">
          <div className="row">
            <div className="col-lg-5 col-md-6 product-single-gallery">
              <div className="product-slider-container">
                <div className="label-group">
                  <div className="product-label label-hot">HOT</div>
                  {discount > 0 && (
                    <div className="product-label label-sale">-{discount}%</div>
                  )}
                </div>

                <Swiper
                  modules={[Thumbs]}
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  className="product-single-carousel show-nav-hover"
                >
                  {product.images?.map((img, index) => (
                    <SwiperSlide key={index}>
                      <Image
                        className="product-single-image"
                        src={img}
                        alt={product.name}
                        width={468}
                        height={468}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
                <span className="prod-full-screen">
                  <i className="icon-plus"></i>
                </span>
              </div>

              <Swiper
                onSwiper={setThumbsSwiper}
                modules={[FreeMode, Thumbs]}
                spaceBetween={10}
                slidesPerView={5}
                freeMode={true}
                watchSlidesProgress={true}
                className="prod-thumbnail"
              >
                {thumbnails.map((thumb, index) => (
                  <SwiperSlide key={index}>
                    <Image
                      src={thumb}
                      width={110}
                      height={110}
                      alt={`Thumbnail ${index + 1}`}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="col-lg-7 col-md-6 product-single-details">
              <h1 className="product-title">{product.name}</h1>

              <div className="product-nav">
                <div className="product-prev">
                  <a href="#">
                    <span className="product-link"></span>
                    <span className="product-popup">
                      <span className="box-content">
                        <Image
                          alt="product"
                          width={150}
                          height={150}
                          src="/assets/images/products/product-3.jpg"
                        />
                        <span>Previous Product</span>
                      </span>
                    </span>
                  </a>
                </div>
                <div className="product-next">
                  <a href="#">
                    <span className="product-link"></span>
                    <span className="product-popup">
                      <span className="box-content">
                        <Image
                          alt="product"
                          width={150}
                          height={150}
                          src="/assets/images/products/product-4.jpg"
                        />
                        <span>Next Product</span>
                      </span>
                    </span>
                  </a>
                </div>
              </div>

              <div className="ratings-container">
                <div className="product-ratings">
                  <span
                    className="ratings"
                    style={{ width: `${(product.rating || 0) * 20}%` }}
                  ></span>
                  <span className="tooltiptext tooltip-top"></span>
                </div>
                <a href="#" className="rating-link">
                  ({product.reviews || 0} Reviews)
                </a>
              </div>

              <div className="price-box">
                {product.oldPrice && (
                  <span className="old-price">{formatPrice(product.oldPrice)}</span>
                )}
                <span className="product-price">{formatPrice(product.price)}</span>
              </div>

              <div className="product-desc">
                <p>{product.shortDescription || product.description}</p>
              </div>

              <div className="product-filters-container">
                <div className="product-single-filter">
                  <label>Size:</label>
                  <ul className="config-size-list">
                    {['S', 'M', 'L', 'XL'].map((size) => (
                      <li key={size}>
                        <a
                          href="#"
                          className={`${selectedSize === size ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedSize(size);
                          }}
                        >
                          {size}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="product-single-filter">
                  <label>Color:</label>
                  <ul className="config-swatch-list">
                    {[
                      { name: 'Black', color: '#000' },
                      { name: 'White', color: '#fff' },
                      { name: 'Red', color: '#ff0000' },
                    ].map((color) => (
                      <li key={color.name}>
                        <a
                          href="#"
                          className={`swatch ${selectedColor === color.name ? 'active' : ''}`}
                          style={{ backgroundColor: color.color }}
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedColor(color.name);
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

              <div className="product-action">
                <div className="product-single-qty">
                  <input
                    className="horizontal-quantity form-control"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                <a
                  href="#"
                  className="btn btn-dark add-cart"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart();
                  }}
                >
                  <i className="icon-shopping-cart"></i>Add to Cart
                </a>

                <a href="/wishlist" className="btn-icon-wish" title="Add to Wishlist">
                  <i className="icon-heart"></i>
                </a>
              </div>

              <div className="product-single-share">
                <label className="sr-only">Share:</label>
                <div className="social-icons mt-2">
                  <a href="#" className="social-icon" target="_blank" title="Facebook">
                    <i className="icon-facebook"></i>
                  </a>
                  <a href="#" className="social-icon" target="_blank" title="Twitter">
                    <i className="icon-twitter"></i>
                  </a>
                  <a href="#" className="social-icon" target="_blank" title="Instagram">
                    <i className="icon-instagram"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="product-single-tabs">
            <ul className="nav nav-tabs" role="tablist">
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === 'description' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('description');
                  }}
                >
                  Description
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('reviews');
                  }}
                >
                  Reviews (2)
                </a>
              </li>
            </ul>

            <div className="tab-content">
              <div
                className={`tab-pane fade ${activeTab === 'description' ? 'show active' : ''}`}
              >
                <div className="product-desc-content">
                  <p>{product.description}</p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              </div>
              <div className={`tab-pane fade ${activeTab === 'reviews' ? 'show active' : ''}`}>
                <div className="reviews">
                  <h3>2 Reviews for {product.name}</h3>
                  <div className="review">
                    <div className="row no-gutters">
                      <div className="col-auto">
                        <h4>
                          <a href="#">John Doe</a>
                        </h4>
                        <div className="ratings-container">
                          <div className="product-ratings">
                            <span className="ratings" style={{ width: '100%' }}></span>
                          </div>
                        </div>
                        <span className="review-date">22 March, 2018</span>
                      </div>
                      <div className="col">
                        <div className="review-content">
                          <p>Excellent product!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

