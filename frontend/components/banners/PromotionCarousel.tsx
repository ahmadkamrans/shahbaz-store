"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export interface PromotionItem {
  image: string;
  alt: string;
  link?: string;
  imageWidth?: number;
  imageHeight?: number;
}

const CAROUSEL_IMAGES = [
  "/assets/images/carousel/banner (1).jpeg",
  "/assets/images/carousel/banner (2).jpeg",
  "/assets/images/carousel/banner (3).jpeg",
  "/assets/images/carousel/banner (4).jpeg",
  "/assets/images/carousel/banner (5).jpeg",
  "/assets/images/carousel/banner (6).jpeg",
  "/assets/images/carousel/banner (7).jpeg",
  "/assets/images/carousel/banner (8).jpeg",
  "/assets/images/carousel/banner (9).jpeg",
  "/assets/images/carousel/banner (10).jpeg",
  "/assets/images/carousel/banner (11).jpeg",
  "/assets/images/carousel/banner (12).jpeg",
];

const DEFAULT_PROMOTIONS: PromotionItem[] = CAROUSEL_IMAGES.map((image, i) => ({
  image,
  alt: `Shahbaz Store - Promotion ${i + 1}`,
  link: "/products",
  imageWidth: 600,
  imageHeight: 400,
}));

interface PromotionCarouselProps {
  heading?: string;
  promotions?: PromotionItem[];
}

export function PromotionCarousel({
  heading,
  promotions = DEFAULT_PROMOTIONS,
}: PromotionCarouselProps) {
  return (
    <section className="promotion-carousel appear-animate mb-5">
      <div className="heading text-center mb-4">
        <h2 className="title title-simple">{heading}</h2>
      </div>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={16}
        slidesPerView={1}
        breakpoints={{
          992: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        navigation
        pagination={{ clickable: true }}
        className="promotion-carousel__swiper"
      >
        {promotions.map((promo, index) => (
          <SwiperSlide key={index}>
            {promo.link ? (
              <Link
                href={promo.link}
                className="promotion-carousel__slide block"
              >
                <figure className="promotion-carousel__figure">
                  <Image
                    src={promo.image}
                    alt={promo.alt}
                    width={promo.imageWidth ?? 400}
                    height={promo.imageHeight ?? 250}
                    className="promotion-carousel__img"
                  />
                </figure>
              </Link>
            ) : (
              <div className="promotion-carousel__slide">
                <figure className="promotion-carousel__figure">
                  <Image
                    src={promo.image}
                    alt={promo.alt}
                    width={promo.imageWidth ?? 400}
                    height={promo.imageHeight ?? 250}
                    className="promotion-carousel__img"
                  />
                </figure>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
