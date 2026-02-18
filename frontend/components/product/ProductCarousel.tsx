'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import 'swiper/css';

interface ProductCarouselProps {
  products: Product[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  return (
    <Swiper
      spaceBetween={20}
      slidesPerView={2}
      breakpoints={{
        576: {
          slidesPerView: 3,
        },
        768: {
          slidesPerView: 4,
        },
        992: {
          slidesPerView: 4,
        },
        1200: {
          slidesPerView: 5,
          spaceBetween: 2,
        },
      }}
      className="products-slider"
    >
      {products.map((product) => (
        <SwiperSlide key={product.id}>
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

