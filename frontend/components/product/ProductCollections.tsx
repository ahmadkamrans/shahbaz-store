"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { productsApi } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils/currency";
import { QuickViewModal } from "@/components/product/QuickViewModal";

interface ProductCollectionsProps {
  categoryId?: string;
}

export function ProductCollections({ categoryId }: ProductCollectionsProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const [featured, bestSelling, latest, topRated] = await Promise.all([
          productsApi.getCollections('featured', categoryId, 3),
          productsApi.getCollections('bestSelling', categoryId, 3),
          productsApi.getCollections('latest', categoryId, 3),
          productsApi.getCollections('topRated', categoryId, 3),
        ]);

        setFeaturedProducts(featured);
        setBestSellingProducts(bestSelling);
        setLatestProducts(latest);
        setTopRatedProducts(topRated);
      } catch (error) {
        console.error("Error fetching product collections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [categoryId]);

  const handleProductClick = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    setQuickViewProduct(product);
  };

  const renderProductItem = (product: Product) => (
    <div key={product.id} className="product-minimal" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
      <figure style={{ flexShrink: 0, margin: 0, cursor: 'pointer' }}>
        <Link 
          href={`/product/${product.slug}`}
          onClick={(e) => handleProductClick(e, product)}
        >
          <Image
            src={product.image}
            alt={product.name}
            width={100}
            height={100}
            style={{ objectFit: 'cover' }}
          />
        </Link>
      </figure>
      <div className="product-details" style={{ flex: 1 }}>
        <h3 className="product-title" style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>
          <Link 
            href={`/product/${product.slug}`}
            onClick={(e) => handleProductClick(e, product)}
            style={{ cursor: 'pointer' }}
          >
            {product.name}
          </Link>
        </h3>
        <div className="ratings-container" style={{ marginBottom: '0.5rem' }}>
          <div className="product-ratings">
            <span
              className="ratings"
              style={{ width: `${(product.rating || 0) * 20}%` }}
            />
            <span className="tooltiptext tooltip-top"></span>
          </div>
        </div>
        <div className="price-box">
          <span className="product-price" style={{ fontSize: '1.1rem', fontWeight: '500' }}>{formatCurrency(product.price)}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="product-collections-section">
        <div className="container">
          <div className="row">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="text-center py-5">
                  <p>Loading...</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="product-collections-section" style={{ marginBottom: '3rem' }}>
      <div className="container">
        <div className="row">
          <div className="col-md-6 col-lg-3">
            <h2 className="collection-title" style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>FEATURED PRODUCTS</h2>
            <div className="product-collection">
              {featuredProducts.length > 0 ? (
                featuredProducts.map(renderProductItem)
              ) : (
                <p className="text-muted" style={{ fontSize: '0.95rem' }}>No featured products available</p>
              )}
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <h2 className="collection-title" style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>BEST SELLING PRODUCTS</h2>
            <div className="product-collection">
              {bestSellingProducts.length > 0 ? (
                bestSellingProducts.map(renderProductItem)
              ) : (
                <p className="text-muted" style={{ fontSize: '0.95rem' }}>No best selling products available</p>
              )}
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <h2 className="collection-title" style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>LATEST PRODUCTS</h2>
            <div className="product-collection">
              {latestProducts.length > 0 ? (
                latestProducts.map(renderProductItem)
              ) : (
                <p className="text-muted" style={{ fontSize: '0.95rem' }}>No latest products available</p>
              )}
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <h2 className="collection-title" style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>TOP RATED PRODUCTS</h2>
            <div className="product-collection">
              {topRatedProducts.length > 0 ? (
                topRatedProducts.map(renderProductItem)
              ) : (
                <p className="text-muted" style={{ fontSize: '0.95rem' }}>No top rated products available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
}
