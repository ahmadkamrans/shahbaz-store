"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/lib/store/cart-store';
import { useWishlist } from '@/lib/store/wishlist-store';
import { useSiteLoading } from '@/lib/loading-context';
import { productsApi } from '@/lib/api/products';
import { reviewsApi, Review } from '@/lib/api/reviews';
import { getAuthToken } from '@/lib/api/config';
import { ProductCollections } from '@/components/product/ProductCollections';

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const {
    addItem: addToWishlist,
    removeItem,
    isInWishlist,
    fetchWishlist,
  } = useWishlist();
  const { setLoading: setSiteLoading } = useSiteLoading();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [variantPrice, setVariantPrice] = useState<number | null>(null);
  const [variantStock, setVariantStock] = useState<number | null>(null);
  const [variantImage, setVariantImage] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [prevProduct, setPrevProduct] = useState<Product | null>(null);
  const [nextProduct, setNextProduct] = useState<Product | null>(null);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const productId = params.id as string;

  // Fetch wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setSiteLoading(true);
        // Backend accepts both ID and slug in the same endpoint
        const productData = await productsApi.getProduct(productId);
        setProduct(productData);

        // Fetch reviews
        const reviewsData = await reviewsApi.getProductReviews(productData.id);
        setReviews(reviewsData);

        // Fetch related products for navigation
        try {
          const relatedProducts = await productsApi.getRelatedProducts(
            productData.id,
            10,
          );
          const currentIndex = relatedProducts.findIndex(
            (p) => p.id === productData.id,
          );

          if (currentIndex > 0) {
            setPrevProduct(relatedProducts[currentIndex - 1]);
          }
          if (currentIndex < relatedProducts.length - 1 && currentIndex >= 0) {
            setNextProduct(relatedProducts[currentIndex + 1]);
          } else if (currentIndex === -1 && relatedProducts.length > 0) {
            // If current product not in related, use first as next
            setNextProduct(relatedProducts[0]);
          }
        } catch (error) {
          // If related products fail, try fetching all products
          try {
            const allProducts = await productsApi.getProducts({ limit: 100 });
            const currentIndex = allProducts.products.findIndex(
              (p) => p.id === productData.id,
            );

            if (currentIndex > 0) {
              setPrevProduct(allProducts.products[currentIndex - 1]);
            }
            if (
              currentIndex < allProducts.products.length - 1 &&
              currentIndex >= 0
            ) {
              setNextProduct(allProducts.products[currentIndex + 1]);
            }
          } catch (err) {
            console.error("Failed to fetch products for navigation:", err);
          }
        }
      } catch (error: any) {
        console.error("Failed to fetch product:", error);
        setError(error?.message || "Failed to load product. Please try again.");
        setProduct(null);
      } finally {
        setLoading(false);
        setSiteLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      // Create proper variant object if variants are selected
      let variantToAdd: any = undefined;
      if (Object.keys(selectedVariants).length > 0) {
        const variantAttributes: Record<string, string> = {};
        Object.entries(selectedVariants).forEach(([type, value]) => {
          if (value) {
            // Find the original key casing from product variants
            const variant = product.variants?.find((v: any) => {
              if (!v.attributes) return false;
              const typeKey = Object.keys(v.attributes).find(
                (k) => k.toLowerCase() === type,
              );
              return typeKey && v.attributes[typeKey] === value;
            });
            if (variant && variant.attributes) {
              const originalKey = Object.keys(variant.attributes).find(
                (k) => k.toLowerCase() === type,
              );
              if (originalKey) {
                variantAttributes[originalKey] = value;
              }
            }
          }
        });

        if (Object.keys(variantAttributes).length > 0) {
          variantToAdd = {
            id: `${product.id}-${Object.values(selectedVariants).join("-")}`,
            name: Object.keys(variantAttributes).join(", "),
            price: variantPrice || product.price,
            inStock:
              variantStock !== null
                ? variantStock > 0
                : product.inStock !== false,
            attributes: variantAttributes,
          };
        }
      }
      addItem(product, quantity, variantToAdd);
      toast.success(`${product.name} added to cart`, {
        icon: "🛒",
      });
    }
  };

  // Update variant price, stock, and image when selected variants change
  useEffect(() => {
    if (!product?.variants || product.variants.length === 0) {
      setSelectedVariant(null);
      setVariantPrice(null);
      setVariantStock(null);
      setVariantImage(null);
      return;
    }

    // If no variants selected, reset everything
    if (Object.keys(selectedVariants).length === 0) {
      setVariantPrice(null);
      setVariantStock(null);
      setVariantImage(null);
      setSelectedVariant(null);
      return;
    }

    // Find variants that match all selected variant types
    const matchingVariants = (product.variants ?? []).filter((v: any) => {
      if (!v.attributes) return false;
      // Check if variant matches all selected variant types
      return Object.entries(selectedVariants).every(([type, value]) => {
        if (!value) return false;
        const typeKey = Object.keys(v.attributes).find(
          (k) => k.toLowerCase() === type,
        );
        return typeKey && v.attributes[typeKey] === value;
      });
    });

    // Try to find exact match first (variant with all selected attributes)
    let matchedVariant = matchingVariants.find((v: any) => {
      if (!v.attributes) return false;
      const variantAttributeKeys = Object.keys(v.attributes).map((k) =>
        k.toLowerCase(),
      );
      const selectedKeys = Object.keys(selectedVariants);
      // Exact match: variant has exactly the same attributes as selected
      return (
        variantAttributeKeys.length === selectedKeys.length &&
        selectedKeys.every((key) => variantAttributeKeys.includes(key))
      );
    });

    // If no exact match, use the first matching variant
    if (!matchedVariant && matchingVariants.length > 0) {
      matchedVariant = matchingVariants[0];
    }

    let variantStockValue: number | null = null;
    let variantImageValue: string | null = null;
    let totalPriceModifier = 0;

    if (matchedVariant) {
      // Use priceModifier if available, otherwise calculate from price difference
      if ((matchedVariant as any).priceModifier !== undefined) {
        totalPriceModifier = (matchedVariant as any).priceModifier;
      } else {
        totalPriceModifier = matchedVariant.price - product.price;
      }

      if ((matchedVariant as any).stock !== undefined) {
        variantStockValue = (matchedVariant as any).stock;
      }
      if ((matchedVariant as any).image) {
        variantImageValue = (matchedVariant as any).image;
      }
    } else {
      // If no exact match, calculate from individual variant selections
      // This handles cases where variants are selected separately
      Object.entries(selectedVariants).forEach(([type, value]) => {
        if (!value) return;
        const typeVariants = (product.variants ?? []).filter((v: any) => {
          if (!v.attributes) return false;
          const typeKey = Object.keys(v.attributes).find(
            (k) => k.toLowerCase() === type,
          );
          return typeKey && v.attributes[typeKey] === value;
        });

        if (typeVariants.length > 0) {
          const variant = typeVariants[0];
          // Use priceModifier if available
          if ((variant as any).priceModifier !== undefined) {
            totalPriceModifier += (variant as any).priceModifier;
          } else {
            totalPriceModifier += variant.price - product.price;
          }

          // Use stock/image from first variant if not already set
          if (
            variantStockValue === null &&
            (variant as any).stock !== undefined
          ) {
            variantStockValue = (variant as any).stock;
          }
          if (variantImageValue === null && (variant as any).image) {
            variantImageValue = (variant as any).image;
          }
        }
      });
    }

    const finalPrice = product.price + totalPriceModifier;
    setVariantPrice(finalPrice !== product.price ? finalPrice : null);
    setVariantStock(variantStockValue);
    setVariantImage(variantImageValue);

    // Set selected variant info for cart
    setSelectedVariant({
      ...selectedVariants,
      priceModifier: totalPriceModifier,
      stock: variantStockValue,
    });
  }, [selectedVariants, product]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      if (isInWishlist(product.id)) {
        await removeItem(product.id);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(product);
        toast.success("Added to wishlist");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update wishlist");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !getAuthToken()) {
      toast.error("Please login to submit a review");
      return;
    }

    // Client-side validation
    if (reviewForm.comment.trim().length < 10) {
      toast.error("Comment must be at least 10 characters long");
      return;
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewsApi.createReview(product.id, {
        rating: Number(reviewForm.rating), // Ensure it's a number
        title: reviewForm.title?.trim() || "",
        comment: reviewForm.comment.trim(),
        images: [], // Include images field with empty array
      });
      // Refresh reviews (only approved reviews will show)
      const reviewsData = await reviewsApi.getProductReviews(product.id);
      setReviews(reviewsData);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted successfully! It will be visible after admin approval.', {
        icon: '⭐',
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!product && !loading) {
    return (
      <main className="main">
        <div className="container">
          <div className="text-center py-5">
            <p>{error || "Product not found."}</p>
            <Link href="/products" className="btn btn-dark">
              Back to Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const discount =
    product?.oldPrice != null &&
    product?.price != null &&
    (product?.oldPrice ?? 0) > 0
      ? Math.round(
          (((product?.oldPrice ?? 0) - (product?.price ?? 0)) /
            (product?.oldPrice ?? 0)) *
            100,
        )
      : 0;

  // Handle image load errors
  const handleImageError = (imgSrc: string) => {
    setFailedImages((prev) => new Set(prev).add(imgSrc));
  };

  // Get image source with fallback
  const defaultImage = "/assets/images/products/product-1.jpg";
  const getImageSrc = (imgSrc: string) => {
    if (failedImages.has(imgSrc) || !imgSrc) {
      return defaultImage;
    }
    return imgSrc;
  };

  // Use fallback image if no images provided, prioritize variant image if available
  const productImages = product
    ? variantImage
      ? [
          variantImage,
          ...(product.images && product.images.length > 0
            ? product.images.filter(
                (img) => img && img.trim() !== "" && img !== variantImage,
              )
            : product.image && product.image !== variantImage
              ? [product.image]
              : []),
        ]
      : product.images && product.images.length > 0
        ? product.images.filter((img) => img && img.trim() !== "")
        : product.image
          ? [product.image]
          : [defaultImage]
    : [defaultImage];

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
              {product?.name ?? ""}
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
                  thumbs={{
                    swiper:
                      thumbsSwiper && !thumbsSwiper.destroyed
                        ? thumbsSwiper
                        : null,
                  }}
                  className="product-single-carousel show-nav-hover"
                >
                  {productImages.map((img, index) => {
                    const imageSrc = getImageSrc(img);
                    return (
                      <SwiperSlide key={index}>
                        <div
                          className="product-image-zoom-container"
                          onMouseEnter={() => setZoomActive(true)}
                          onMouseLeave={() => {
                            setZoomActive(false);
                            setZoomPosition({ x: 0, y: 0 });
                          }}
                          onMouseMove={(e) => {
                            const container = e.currentTarget;
                            const rect = container.getBoundingClientRect();

                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;

                            // Calculate percentage position within the container
                            const percentX = (x / rect.width) * 100;
                            const percentY = (y / rect.height) * 100;

                            setZoomPosition({
                              x: Math.max(0, Math.min(100, percentX)),
                              y: Math.max(0, Math.min(100, percentY)),
                            });
                          }}
                        >
                          <img
                            className={`product-single-image ${zoomActive ? "zoomed" : ""}`}
                            src={imageSrc}
                            alt={product?.name ?? ""}
                            onError={() => handleImageError(img)}
                            style={{
                              width: "100%",
                              height: "auto",
                              display: "block",
                              transform: zoomActive
                                ? `scale(2.5) translate(${(50 - zoomPosition.x) * 0.6}%, ${(50 - zoomPosition.y) * 0.6}%)`
                                : "scale(1)",
                              transformOrigin: "center center",
                            }}
                          />
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
                <span className="prod-full-screen">
                  <i className="icon-plus"></i>
                </span>
              </div>

              {productImages.length > 1 && (
                <Swiper
                  onSwiper={setThumbsSwiper}
                  modules={[FreeMode, Thumbs]}
                  spaceBetween={0}
                  slidesPerView={Math.min(5, productImages.length)}
                  freeMode={true}
                  watchSlidesProgress={true}
                  className="prod-thumbnail"
                >
                  {productImages.map((thumb, index) => {
                    const thumbSrc = getImageSrc(thumb);
                    return (
                      <SwiperSlide
                        key={index}
                        className="product-thumbnail-slide"
                      >
                        <img
                          src={thumbSrc}
                          alt={`Thumbnail ${index + 1}`}
                          onError={() => handleImageError(thumb)}
                        />
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              )}
            </div>

            <div className="col-lg-7 col-md-6 product-single-details">
              <h1 className="product-title">{product?.name ?? ""}</h1>

              <div className="product-nav">
                {prevProduct && (
                  <div className="product-prev">
                    <Link
                      href={`/product/${prevProduct.slug || prevProduct.id}`}
                    >
                      <span className="product-link"></span>
                      <span className="product-popup">
                        <span className="box-content">
                          <Image
                            alt={prevProduct.name}
                            width={150}
                            height={150}
                            src={prevProduct.image}
                          />
                          <span>Previous Product</span>
                        </span>
                      </span>
                    </Link>
                  </div>
                )}
                {nextProduct && (
                  <div className="product-next">
                    <Link
                      href={`/product/${nextProduct.slug || nextProduct.id}`}
                    >
                      <span className="product-link"></span>
                      <span className="product-popup">
                        <span className="box-content">
                          <Image
                            alt={nextProduct.name}
                            width={150}
                            height={150}
                            src={nextProduct.image}
                          />
                          <span>Next Product</span>
                        </span>
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="ratings-container">
                <div className="product-ratings">
                  <span
                    className="ratings"
                    style={{ width: `${(product.rating || 0) * 20}%`, color: '#ffc107' }}
                  ></span>
                  <span className="tooltiptext tooltip-top"></span>
                </div>
                <a
                  href="#"
                  className="rating-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("reviews");
                  }}
                  style={{ cursor: "pointer" }}
                >
                  ({reviews.length} Review{reviews.length !== 1 ? "s" : ""})
                </a>
              </div>

              <div className="price-box">
                {(product?.oldPrice ?? 0) > 0 && (
                  <span className="old-price">
                    {formatPrice(product?.oldPrice ?? 0)}
                  </span>
                )}
                <span className="product-price">
                  {formatPrice(variantPrice ?? product?.price ?? 0)}
                </span>
                {variantPrice != null &&
                  variantPrice !== (product?.price ?? 0) && (
                    <small className="text-muted d-block">
                      Original: {formatPrice(product?.price ?? 0)}
                    </small>
                  )}
              </div>

              <div className="product-desc">
                <p>
                  {(product?.shortDescription || product?.description) ?? ""}
                </p>
              </div>

              <div className="product-filters-container">
                {(() => {
                  if (!product) return null;
                  // Extract variant types and options from product variants
                  if (!product.variants || product.variants.length === 0) {
                    return null;
                  }

                  // Group variants by type (Size, Color, etc.) - case insensitive, preserve original key
                  const variantGroups: Record<
                    string,
                    { values: Set<string>; originalKey: string }
                  > = {};
                  product.variants.forEach((v: any) => {
                    if (v.attributes) {
                      Object.entries(v.attributes).forEach(([key, value]) => {
                        // Normalize key to lowercase for consistent lookup
                        const normalizedKey = key.toLowerCase();
                        if (!variantGroups[normalizedKey]) {
                          variantGroups[normalizedKey] = {
                            values: new Set(),
                            originalKey: key, // Preserve original casing
                          };
                        }
                        variantGroups[normalizedKey].values.add(
                          value as string,
                        );
                      });
                    }
                  });

                  // Get all variant types dynamically
                  const variantTypes = Object.keys(variantGroups);

                  if (variantTypes.length === 0) {
                    return null;
                  }

                  // Color mapping helper
                  const getColorValue = (colorName: string): string => {
                    const colorMap: Record<string, string> = {
                      Black: "#000000",
                      black: "#000000",
                      White: "#ffffff",
                      white: "#ffffff",
                      Red: "#ff0000",
                      red: "#ff0000",
                      Blue: "#0000ff",
                      blue: "#0000ff",
                      Green: "#00ff00",
                      green: "#00ff00",
                      Yellow: "#ffff00",
                      yellow: "#ffff00",
                      Orange: "#ffa500",
                      orange: "#ffa500",
                      Purple: "#800080",
                      purple: "#800080",
                      Pink: "#ffc0cb",
                      pink: "#ffc0cb",
                      Gray: "#808080",
                      grey: "#808080",
                      gray: "#808080",
                      Brown: "#a52a2a",
                      brown: "#a52a2a",
                      Navy: "#000080",
                      navy: "#000080",
                    };
                    return colorMap[colorName] || "#cccccc";
                  };

                  // Build the JSX array directly
                  const variantSelectors = variantTypes.map(
                    (normalizedType) => {
                      const variantGroup = variantGroups[normalizedType];
                      const variantSet = variantGroup.values;
                      const originalKey = variantGroup.originalKey;
                      const displayName =
                        originalKey.charAt(0).toUpperCase() +
                        originalKey.slice(1);
                      const isColorType = normalizedType === "color";
                      const selectedValue =
                        selectedVariants[normalizedType] || "";

                      return (
                        <div
                          key={normalizedType}
                          className="product-single-filter"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "1rem",
                          }}
                        >
                          <label
                            style={{
                              marginRight: "4.2rem",
                              minWidth: "5rem",
                              marginBottom: 0,
                              color: "#777",
                              fontWeight: 400,
                            }}
                          >
                            {displayName}:
                          </label>
                          {isColorType ? (
                            <ul className="config-swatch-list">
                              {Array.from(variantSet).map((value: string) => {
                                const matchingVariants = (
                                  product.variants ?? []
                                ).filter((v: any) => {
                                  if (!v.attributes) return false;
                                  const typeKey = Object.keys(
                                    v.attributes,
                                  ).find(
                                    (k) => k.toLowerCase() === normalizedType,
                                  );
                                  return (
                                    typeKey && v.attributes[typeKey] === value
                                  );
                                });
                                const isAvailable = matchingVariants.some(
                                  (v: any) =>
                                    v.inStock !== false &&
                                    ((v as any).stock === undefined ||
                                      (v as any).stock > 0),
                                );
                                const colorValue = getColorValue(value);

                                return (
                                  <li key={value}>
                                    <a
                                      href="#"
                                      className={`swatch ${selectedValue === value ? "active" : ""} ${!isAvailable ? "disabled" : ""}`}
                                      style={{
                                        backgroundColor: colorValue,
                                        opacity: !isAvailable ? 0.5 : 1,
                                        cursor: !isAvailable
                                          ? "not-allowed"
                                          : "pointer",
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (isAvailable) {
                                          setSelectedVariants((prev) => ({
                                            ...prev,
                                            [normalizedType]: value,
                                          }));
                                        }
                                      }}
                                      title={value}
                                    >
                                      <span></span>
                                    </a>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <ul
                              className="config-size-list"
                              style={{
                                display: "block",
                                listStyle: "none",
                                padding: 0,
                                margin: 0,
                                fontSize: 0,
                                lineHeight: 0,
                              }}
                            >
                              {Array.from(variantSet).map((value: string) => {
                                const matchingVariants = (
                                  product.variants ?? []
                                ).filter((v: any) => {
                                  if (!v.attributes) return false;
                                  const typeKey = Object.keys(
                                    v.attributes,
                                  ).find(
                                    (k) => k.toLowerCase() === normalizedType,
                                  );
                                  return (
                                    typeKey && v.attributes[typeKey] === value
                                  );
                                });
                                const isAvailable = matchingVariants.some(
                                  (v: any) =>
                                    v.inStock !== false &&
                                    ((v as any).stock === undefined ||
                                      (v as any).stock > 0),
                                );

                                return (
                                  <li
                                    key={value}
                                    className={
                                      selectedValue === value ? "active" : ""
                                    }
                                    style={{
                                      display: "inline-flex",
                                      fontSize: "1.4rem",
                                      verticalAlign: "top",
                                      marginBottom: 0,
                                      marginRight: 0,
                                      color: "#777",
                                    }}
                                  >
                                    <a
                                      href="#"
                                      className={!isAvailable ? "disabled" : ""}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (isAvailable) {
                                          setSelectedVariants((prev) => ({
                                            ...prev,
                                            [normalizedType]: value,
                                          }));
                                        }
                                      }}
                                      style={{
                                        display: "block",
                                        minWidth: "3.2rem",
                                        height: "2.6rem",
                                        lineHeight: "2.6rem",
                                        textAlign: "center",
                                        textDecoration: "none",
                                        margin: "3px 6px 3px 0",
                                        border: "1px solid #eee",
                                        color: "inherit",
                                        ...(!isAvailable
                                          ? {
                                              cursor: "not-allowed",
                                              opacity: 0.5,
                                            }
                                          : { cursor: "pointer" }),
                                      }}
                                    >
                                      {value}
                                    </a>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      );
                    },
                  );

                  return <>{variantSelectors}</>;
                })()}
              </div>

              {/* Show stock status */}
              {variantStock !== null && (
                <div className="product-stock-info mb-3">
                  <span
                    className={`badge ${variantStock > 0 ? "badge-success" : "badge-danger"}`}
                  >
                    {variantStock > 0
                      ? `In Stock (${variantStock} available)`
                      : "Out of Stock"}
                  </span>
                </div>
              )}

              <div
                className="product-action"
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  gap: "10px",
                  flexWrap: "nowrap",
                }}
              >
                <div
                  className="product-single-qty product-detail-qty m-0"
                  style={{ display: "flex", alignItems: "stretch" }}
                >
                  <input
                    className="horizontal-quantity form-control product-detail-quantity-input m-0"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                <a
                  href="#"
                  className="btn btn-dark add-cart product-detail-add-cart"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!product) return;
                    // Check if variants are required but not selected
                    const hasVariants =
                      product.variants && product.variants.length > 0;
                    if (hasVariants) {
                      // Get all variant types dynamically
                      const variantGroups: Record<string, Set<string>> = {};
                      (product.variants ?? []).forEach((v: any) => {
                        if (v.attributes) {
                          Object.entries(v.attributes).forEach(
                            ([key, value]) => {
                              const normalizedKey = key.toLowerCase();
                              if (!variantGroups[normalizedKey]) {
                                variantGroups[normalizedKey] = new Set();
                              }
                              variantGroups[normalizedKey].add(value as string);
                            },
                          );
                        }
                      });

                      // Check if all required variant types are selected
                      const variantTypes = Object.keys(variantGroups);
                      const missingVariants = variantTypes.filter((type) => {
                        return (
                          !selectedVariants[type] ||
                          !selectedVariants[type].trim()
                        );
                      });

                      if (missingVariants.length > 0) {
                        const missingNames = missingVariants.map((type) => {
                          // Find original casing from product variants
                          const variant = (product.variants ?? []).find(
                            (v: any) => {
                              if (!v.attributes) return false;
                              return Object.keys(v.attributes).some(
                                (k) => k.toLowerCase() === type,
                              );
                            },
                          );
                          if (variant && variant.attributes) {
                            const originalKey = Object.keys(
                              variant.attributes,
                            ).find((k) => k.toLowerCase() === type);
                            return originalKey || type;
                          }
                          return type.charAt(0).toUpperCase() + type.slice(1);
                        });
                        toast.error(
                          `Please select: ${missingNames.join(", ")}`,
                        );
                        return;
                      }

                      // Check stock availability
                      if (variantStock !== null && variantStock === 0) {
                        toast.error("This variant is out of stock");
                        return;
                      }
                    }
                    handleAddToCart();
                  }}
                  style={{
                    margin: "0",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {variantStock !== null && variantStock === 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </a>

                <a
                  href="#"
                  className={`btn-icon-wish ${product && isInWishlist(product.id) ? "added-wishlist" : ""}`}
                  title={
                    product && isInWishlist(product.id)
                      ? "Remove from Wishlist"
                      : "Add to Wishlist"
                  }
                  onClick={handleToggleWishlist}
                  style={{
                    marginLeft: "0",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="icon-heart"></i>
                </a>
              </div>

              <div className="product-single-share">
                <label className="product-single-share__label mr-3 mb-0">
                  Share:
                </label>
                <div className="social-icons">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.href : "",
                    )}`}
                    className="social-icon"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on Facebook"
                  >
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.href : "",
                    )}&text=${encodeURIComponent(product?.name ?? "")}`}
                    className="social-icon"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on Twitter"
                  >
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.href : "",
                    )}`}
                    className="social-icon"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on LinkedIn"
                  >
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(product?.name ?? "")}&body=${encodeURIComponent(
                      `Check out this product: ${typeof window !== "undefined" ? window.location.href : ""}`,
                    )}`}
                    className="social-icon"
                    title="Share via Email"
                  >
                    <i className="fas fa-envelope"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="product-single-tabs">
            <ul className="nav nav-tabs" role="tablist">
              <li className="nav-item">
                <a
                  href="#"
                  className={`nav-link ${activeTab === "description" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("description");
                  }}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  DESCRIPTION
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#"
                  className={`nav-link ${activeTab === "additional" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("additional");
                  }}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  ADDITIONAL INFORMATION
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="#"
                  className={`nav-link ${activeTab === "reviews" ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab("reviews");
                  }}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  REVIEWS ({reviews.length})
                </a>
              </li>
            </ul>

            <div className="tab-content">
              <div
                className={`tab-pane fade ${activeTab === "description" ? "show active" : ""}`}
              >
                <div className="product-desc-content">
                  <p>{product?.description ?? ""}</p>
                </div>
              </div>
              <div
                className={`tab-pane fade ${activeTab === "additional" ? "show active" : ""}`}
              >
                <div className="product-additional-info">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {product?.categoryInfo && (
                        <tr>
                          <td
                            style={{
                              fontWeight: 600,
                              width: "30%",
                              padding: "12px 15px",
                              borderBottom: "1px solid #e0e0e0",
                              color: "#333",
                            }}
                          >
                            Category
                          </td>
                          <td
                            style={{
                              padding: "12px 15px",
                              borderBottom: "1px solid #e0e0e0",
                              color: "#666",
                            }}
                          >
                            <Link
                              href={`/products?category=${product?.categoryInfo?.id ?? ""}`}
                              style={{ color: "#666", textDecoration: "none" }}
                            >
                              {product?.categoryInfo?.name ?? ""}
                            </Link>
                          </td>
                        </tr>
                      )}
                      {(product?.variants?.length ?? 0) > 0 &&
                        (() => {
                          if (!product) return null;
                          // Group variants by type (Color, Size, etc.)
                          const variantGroups: Record<string, Set<string>> = {};
                          (product.variants ?? []).forEach((v: any) => {
                            if (v.attributes) {
                              Object.entries(v.attributes).forEach(
                                ([key, value]) => {
                                  if (!variantGroups[key]) {
                                    variantGroups[key] = new Set();
                                  }
                                  variantGroups[key].add(value as string);
                                },
                              );
                            }
                          });

                          return Object.entries(variantGroups).map(
                            ([type, values]) => (
                              <tr key={type}>
                                <td
                                  style={{
                                    fontWeight: 600,
                                    width: "30%",
                                    padding: "12px 15px",
                                    borderBottom: "1px solid #e0e0e0",
                                    color: "#333",
                                  }}
                                >
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </td>
                                <td
                                  style={{
                                    padding: "12px 15px",
                                    borderBottom: "1px solid #e0e0e0",
                                    color: "#666",
                                  }}
                                >
                                  {Array.from(values).join(", ")}
                                </td>
                              </tr>
                            ),
                          );
                        })()}
                    </tbody>
                  </table>
                </div>
              </div>
              <div
                className={`tab-pane fade ${activeTab === "reviews" ? "show active" : ""}`}
              >
                <div className="reviews">
                  <h3>
                    {reviews.length} Review{reviews.length !== 1 ? "s" : ""} for{" "}
                    {product?.name ?? ""}
                  </h3>

                  {reviews.length === 0 ? (
                    <p>No reviews yet. Be the first to review this product!</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review._id} className="review">
                        <div className="row no-gutters">
                          <div className="col-auto">
                            <h4>
                              <a href="#">{review.user.name}</a>
                            </h4>
                            <div className="ratings-container">
                              <div className="product-ratings">
                                <span className="ratings" style={{ width: `${review.rating * 20}%`, color: '#ffc107' }}></span>
                              </div>
                            </div>
                            <span className="review-date">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="col">
                            <div className="review-content">
                              {review.title && <h5>{review.title}</h5>}
                              <p>{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {getAuthToken() && (
                    <div className="review-form mt-4">
                      <h4>Add a Review</h4>
                      <form onSubmit={handleSubmitReview}>
                        <div className="form-group">
                          <label>Rating *</label>
                          <select
                            className="form-control"
                            value={reviewForm.rating}
                            onChange={(e) =>
                              setReviewForm({
                                ...reviewForm,
                                rating: parseInt(e.target.value),
                              })
                            }
                            required
                          >
                            <option value={5}>5 Stars</option>
                            <option value={4}>4 Stars</option>
                            <option value={3}>3 Stars</option>
                            <option value={2}>2 Stars</option>
                            <option value={1}>1 Star</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Title (optional)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={reviewForm.title}
                            onChange={(e) =>
                              setReviewForm({
                                ...reviewForm,
                                title: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Comment * (minimum 10 characters)</label>
                          <textarea
                            className="form-control"
                            rows={5}
                            value={reviewForm.comment}
                            onChange={(e) =>
                              setReviewForm({
                                ...reviewForm,
                                comment: e.target.value,
                              })
                            }
                            required
                            minLength={10}
                          />
                          {reviewForm.comment.length > 0 &&
                            reviewForm.comment.length < 10 && (
                              <small className="text-danger">
                                {10 - reviewForm.comment.length} more characters
                                required
                              </small>
                            )}
                        </div>
                        <button
                          type="submit"
                          className="btn btn-dark"
                          disabled={submittingReview}
                        >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {product?.categoryInfo?.id && (
        <ProductCollections categoryId={product.categoryInfo.id} />
      )}
    </main>
  );
}
