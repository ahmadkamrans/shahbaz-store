'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const partnerLogos = [
  '/assets/images/demoes/demo29/logos/1.png',
  '/assets/images/demoes/demo29/logos/2.png',
  '/assets/images/demoes/demo29/logos/3.png',
  '/assets/images/demoes/demo29/logos/4.png',
  '/assets/images/demoes/demo29/logos/5.png',
  '/assets/images/demoes/demo29/logos/6.png',
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="partners-panel">
        <div className="container">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={20}
            slidesPerView={2}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            loop={true}
            breakpoints={{
              576: {
                slidesPerView: 3,
              },
              991: {
                slidesPerView: 4,
              },
              1200: {
                slidesPerView: 5,
              },
              1400: {
                slidesPerView: 6,
                spaceBetween: 0,
              },
            }}
            className="partners-carousel text-center"
          >
            {partnerLogos.map((logo, index) => (
              <SwiperSlide key={index}>
                <Image
                  src={logo}
                  width={148}
                  height={57}
                  alt={`Partner logo ${index + 1}`}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <div className="container">
        <div className="footer-middle row">
          <div className="col-lg-5 col-xl-6">
            <div className="row mt-2" style={{ display: 'flex', alignItems: 'center' }}>
              <div className="col-md-4 col-lg-12 col-xl-4">
                <Link href="/" className="logo-footer">
                  <Image
                    src="/assets/images/logo-black.png"
                    width={112}
                    height={44}
                    alt="logo"
                  />
                </Link>
              </div>
              <div className="col-md-8 col-lg-12 col-xl-8">
                <div className="social-link">
                  <h4>Questions</h4>
                  <div className="links">
                    <a href="tel:1-888-123-456" className="phone_link">
                      1-888-123-456
                    </a>
                    <hr className="vertical" />
                    <div className="social-icons">
                      <a
                        href="#"
                        className="social-icon social-facebook"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Facebook"
                      >
                        <i className="icon-facebook"></i>
                      </a>
                      <a
                        href="#"
                        className="social-icon social-twitter"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Twitter"
                      >
                        <i className="icon-twitter"></i>
                      </a>
                      <a
                        href="#"
                        className="social-icon social-instagram"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="instagram"
                      >
                        <i className="icon-instagram"></i>
                      </a>
                      <a
                        href="#"
                        className="social-icon social-linkedin"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Linkedin"
                      >
                        <i className="fab fa-linkedin-in"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-7 col-xl-6">
            <div className="row">
              <div className="col-md-4 col-lg-4">
                <div className="widget">
                  <h3 className="widget-title">Account</h3>
                  <div className="widget-content">
                    <ul>
                      <li>
                        <Link href="/dashboard">My Account</Link>
                      </li>
                      <li>
                        <a href="#">Track Your Order</a>
                      </li>
                      <li>
                        <a href="#">Payment Methods</a>
                      </li>
                      <li>
                        <a href="#">Shipping Guide</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-lg-4">
                <div className="widget">
                  <h3 className="widget-title">About</h3>
                  <div className="widget-content">
                    <ul>
                      <li>
                        <Link href="/about">About Porto</Link>
                      </li>
                      <li>
                        <a href="#">Our Guarantees</a>
                      </li>
                      <li>
                        <a href="#">Terms And Conditions</a>
                      </li>
                      <li>
                        <a href="#">Privacy Policy</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-md-4 col-lg-4">
                <div className="widget">
                  <h3 className="widget-title">Features</h3>
                  <div className="widget-content">
                    <ul>
                      <li>
                        <a href="#">Powerful Admin Panel</a>
                      </li>
                      <li>
                        <a href="#">Mobile & Retina Optimized</a>
                      </li>
                      <li>
                        <a href="#">Super Fast Html Template</a>
                      </li>
                      <li>
                        <a href="#">1st Fully working Ajax Theme</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom d-lg-flex align-items-center">
          <p className="footer-copyright font2 mb-0">
            © copyright 2021. All Rights Reserved.
          </p>
          <Image
            className="ml-lg-auto ml-0 mt-lg-0 mt-1"
            src="/assets/images/demoes/demo29/payments_long.png"
            width={255}
            height={22}
            alt="payment"
          />
        </div>
      </div>
    </footer>
  );
}

