"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import toast from "react-hot-toast";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/store/cart-store";
import { useWishlist } from "@/lib/store/wishlist-store";
import { productsApi } from "@/lib/api/products";

interface QuickViewModalProps {
  productId?: string | null;
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({
  productId,
  product: initialProduct,
  isOpen,
  onClose,
}: QuickViewModalProps) {
  const [product, setProduct] = useState<Product | null>(
    initialProduct || null,
  );
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [variantPrice, setVariantPrice] = useState<number | null>(null);
  const [variantStock, setVariantStock] = useState<number | null>(null);
  const [variantImage, setVariantImage] = useState<string | null>(null);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem, isInWishlist } = useWishlist();

  useEffect(() => {
    // If product is passed directly, use it
    if (initialProduct) {
      setProduct(initialProduct);
      setQuantity(1);
      setError(null);
      setSelectedVariants({});
      setVariantPrice(null);
      setVariantStock(null);
      setVariantImage(null);
      setFailedImages(new Set());
      setThumbsSwiper(null);
      return;
    }

    // Otherwise, fetch by ID
    if (isOpen && productId) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          setError(null);
          setProduct(null);
          // Try to fetch by ID first, if that fails try by slug
          let productData: Product;
          try {
            productData = await productsApi.getProduct(productId);
          } catch {
            productData = await productsApi.getProductBySlug(productId);
          }
          setProduct(productData);
          setQuantity(1);
          setSelectedVariants({});
          setVariantPrice(null);
          setVariantStock(null);
          setVariantImage(null);
          setFailedImages(new Set());
          setThumbsSwiper(null);
        } catch (error: any) {
          console.error("Failed to fetch product:", error);
          setError(error.message || "Failed to load product");
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    } else {
      // Reset when modal closes
      setProduct(null);
      setQuantity(1);
      setError(null);
      setSelectedVariants({});
      setVariantPrice(null);
      setVariantStock(null);
      setVariantImage(null);
      setFailedImages(new Set());
      setThumbsSwiper(null);
      setZoomActive(false);
      setZoomPosition({ x: 50, y: 50 });
    }
  }, [isOpen, productId, initialProduct]);

  // Update variant price and stock when selected variants change
  useEffect(() => {
    if (!product?.variants || product.variants.length === 0) {
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
  }, [selectedVariants, product]);

  if (!isOpen) return null;

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

  const handleAddToCart = () => {
    if (product) {
      // Check if variants are required but not selected
      const hasVariants = product.variants && product.variants.length > 0;
      if (hasVariants) {
        // Get all variant types dynamically (case insensitive)
        const variantGroups: Record<string, Set<string>> = {};
        (product.variants ?? []).forEach((v: any) => {
          if (v.attributes) {
            Object.entries(v.attributes).forEach(([key, value]) => {
              const normalizedKey = key.toLowerCase();
              if (!variantGroups[normalizedKey]) {
                variantGroups[normalizedKey] = new Set();
              }
              variantGroups[normalizedKey].add(value as string);
            });
          }
        });

        // Check if all required variant types are selected
        const variantTypes = Object.keys(variantGroups);
        const missingVariants = variantTypes.filter((type) => {
          return !selectedVariants[type] || !selectedVariants[type].trim();
        });

        if (missingVariants.length > 0) {
          const missingNames = missingVariants.map((type) => {
            // Find original casing from product variants
            const variant = (product.variants ?? []).find((v: any) => {
              if (!v.attributes) return false;
              return Object.keys(v.attributes).some(
                (k) => k.toLowerCase() === type,
              );
            });
            if (variant && variant.attributes) {
              const originalKey = Object.keys(variant.attributes).find(
                (k) => k.toLowerCase() === type,
              );
              return originalKey || type;
            }
            return type.charAt(0).toUpperCase() + type.slice(1);
          });
          toast.error(`Please select: ${missingNames.join(", ")}`);
          return;
        }

        // Check stock availability
        if (variantStock !== null && variantStock === 0) {
          toast.error("This variant is out of stock");
          return;
        }
      }

      // Create proper variant object if variants are selected
      let variantToAdd: any = undefined;
      if (Object.keys(selectedVariants).length > 0) {
        const variantAttributes: Record<string, string> = {};
        Object.entries(selectedVariants).forEach(([type, value]) => {
          if (value) {
            // Find the original key casing from product variants
            const variant = (product.variants ?? []).find((v: any) => {
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
      addToCart(product, quantity, variantToAdd);
      toast.success(`${product.name} added to cart`, {
        icon: "🛒",
      });
      onClose();
    }
  };

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

  if (!isOpen) return null;

  const modalContent = (
    <>
      <div
        className="quick-view-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="modal quick-view-modal show"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
      >
        <div
          className="modal-dialog modal-lg quick-view-dialog"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content quick-view-content">
            <div className="modal-header quick-view-header">
              <h5 id="quick-view-title" className="modal-title">
                {product ? product.name : "Quick View"}
              </h5>
              <button
                type="button"
                className="close quick-view-close"
                onClick={onClose}
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body quick-view-body">
              {loading ? (
                <div className="text-center py-5">
                  <p>Loading product...</p>
                </div>
              ) : product ? (
                <div className="row">
                  <div className="col-md-6">
                    <div className="product-slider-container">
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
                                  setZoomPosition({ x: 50, y: 50 });
                                }}
                                onMouseMove={(e) => {
                                  const container = e.currentTarget;
                                  const rect =
                                    container.getBoundingClientRect();

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
                                style={{
                                  borderRadius: "8px",
                                  overflow: "hidden",
                                }}
                              >
                                <img
                                  className={`product-single-image ${zoomActive ? "zoomed" : ""}`}
                                  src={imageSrc}
                                  alt={product.name || "Product"}
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

                      {productImages.length > 1 && (
                        <Swiper
                          onSwiper={setThumbsSwiper}
                          modules={[FreeMode, Thumbs]}
                          spaceBetween={10}
                          slidesPerView={Math.min(4, productImages.length)}
                          freeMode={true}
                          watchSlidesProgress={true}
                          className="prod-thumbnail mt-3"
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
                                  style={{
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                  }}
                                />
                              </SwiperSlide>
                            );
                          })}
                        </Swiper>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h3 className="mb-2">{product.name || "Product"}</h3>
                    {product.category && (
                      <div className="mb-1">
                        <Link href="/products" className="text-muted small">
                          {product.category}
                        </Link>
                      </div>
                    )}
                    {product.rating !== undefined && (
                      <div className="ratings-container mb-3">
                        <div className="product-ratings">
                          <span
                            className="ratings"
                            style={{ width: `${(product.rating || 0) * 20}%`, color: '#ffc107' }}
                          ></span>
                        </div>
                        {product.reviews !== undefined && (
                          <span className="rating-text ml-2">
                            ({product.reviews} review
                            {product.reviews !== 1 ? "s" : ""})
                          </span>
                        )}
                      </div>
                    )}
                    <div className="price-box mb-3">
                      {product.oldPrice &&
                        product.oldPrice > 0 &&
                        product.oldPrice > (product.price || 0) && (
                          <del className="old-price mr-2">
                            {formatPrice(product.oldPrice)}
                          </del>
                        )}
                      <span className="product-price">
                        {variantPrice !== null
                          ? formatPrice(variantPrice)
                          : product.price && product.price > 0
                            ? formatPrice(product.price)
                            : "Price not available"}
                      </span>
                    </div>

                    {/* Variant Selectors */}
                    {product.variants &&
                      product.variants.length > 0 &&
                      (() => {
                        // Group variants by type (case insensitive, preserve original key)
                        const variantGroups: Record<
                          string,
                          { values: Set<string>; originalKey: string }
                        > = {};
                        (product.variants ?? []).forEach((v: any) => {
                          if (v.attributes) {
                            Object.entries(v.attributes).forEach(
                              ([key, value]) => {
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
                              },
                            );
                          }
                        });

                        const variantTypes = Object.keys(variantGroups);
                        if (variantTypes.length === 0) return null;

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

                        return (
                          <div className="product-filters-container mb-3">
                            {variantTypes.map((normalizedType) => {
                              const variantGroup =
                                variantGroups[normalizedType];
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
                                  className="product-single-filter mb-2"
                                >
                                  <label className="d-block mb-0 mr-1">
                                    {displayName}:
                                  </label>
                                  {isColorType ? (
                                    <div className="d-flex gap-2 flex-wrap">
                                      {Array.from(variantSet).map(
                                        (value: string) => {
                                          const matchingVariants = (
                                            product.variants ?? []
                                          ).filter((v: any) => {
                                            if (!v.attributes) return false;
                                            const typeKey = Object.keys(
                                              v.attributes,
                                            ).find(
                                              (k) =>
                                                k.toLowerCase() ===
                                                normalizedType,
                                            );
                                            return (
                                              typeKey &&
                                              v.attributes[typeKey] === value
                                            );
                                          });
                                          const isAvailable =
                                            matchingVariants.some(
                                              (v: any) =>
                                                v.inStock !== false &&
                                                ((v as any).stock ===
                                                  undefined ||
                                                  (v as any).stock > 0),
                                            );
                                          const colorValue =
                                            getColorValue(value);

                                          return (
                                            <button
                                              key={value}
                                              type="button"
                                              className={`btn btn-sm ${selectedValue === value ? "btn-dark" : "btn-outline-dark"} ${!isAvailable ? "disabled" : ""}`}
                                              onClick={() =>
                                                isAvailable &&
                                                setSelectedVariants((prev) => ({
                                                  ...prev,
                                                  [normalizedType]: value,
                                                }))
                                              }
                                              disabled={!isAvailable}
                                              style={{
                                                backgroundColor:
                                                  selectedValue === value
                                                    ? colorValue
                                                    : "transparent",
                                                borderColor: colorValue,
                                                color:
                                                  selectedValue === value
                                                    ? "#fff"
                                                    : colorValue,
                                                opacity: !isAvailable ? 0.5 : 1,
                                              }}
                                              title={value}
                                            >
                                              {value}
                                            </button>
                                          );
                                        },
                                      )}
                                    </div>
                                  ) : (
                                    <div className="d-flex gap-2 flex-wrap">
                                      {Array.from(variantSet).map(
                                        (value: string) => {
                                          const matchingVariants = (
                                            product.variants ?? []
                                          ).filter((v: any) => {
                                            if (!v.attributes) return false;
                                            const typeKey = Object.keys(
                                              v.attributes,
                                            ).find(
                                              (k) =>
                                                k.toLowerCase() ===
                                                normalizedType,
                                            );
                                            return (
                                              typeKey &&
                                              v.attributes[typeKey] === value
                                            );
                                          });
                                          const isAvailable =
                                            matchingVariants.some(
                                              (v: any) =>
                                                v.inStock !== false &&
                                                ((v as any).stock ===
                                                  undefined ||
                                                  (v as any).stock > 0),
                                            );

                                          return (
                                            <button
                                              key={value}
                                              type="button"
                                              className={`btn btn-sm ${selectedValue === value ? "btn-dark" : "btn-outline-dark"} ${!isAvailable ? "disabled" : ""}`}
                                              onClick={() =>
                                                isAvailable &&
                                                setSelectedVariants((prev) => ({
                                                  ...prev,
                                                  [normalizedType]: value,
                                                }))
                                              }
                                              disabled={!isAvailable}
                                              style={
                                                !isAvailable
                                                  ? { opacity: 0.5 }
                                                  : {}
                                              }
                                            >
                                              {value}
                                            </button>
                                          );
                                        },
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {variantStock !== null && (
                              <div className="mb-2">
                                <span
                                  className={`badge ${variantStock > 0 ? "badge-success" : "badge-danger"}`}
                                >
                                  {variantStock > 0
                                    ? `In Stock (${variantStock})`
                                    : "Out of Stock"}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                    {(product.shortDescription || product.description) && (
                      <div className="product-desc mb-3">
                        <p>{product.shortDescription || product.description}</p>
                      </div>
                    )}
                    <div className="product-action d-flex align-items-baseline gap-3 mb-3">
                      <div className="product-single-qty">
                        <input
                          className="horizontal-quantity form-control"
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setQuantity(Math.max(1, val));
                          }}
                          style={{ width: "80px" }}
                        />
                      </div>
                      <button
                        className="btn btn-dark"
                        onClick={handleAddToCart}
                        disabled={
                          (variantStock !== null && variantStock === 0) ||
                          (product.inStock === false && variantStock === null)
                        }
                      >
                        {(variantStock !== null && variantStock === 0) ||
                        (product.inStock === false && variantStock === null)
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </button>
                      <a
                        href="#"
                        className={`btn-icon-wish ${isInWishlist(product.id) ? "added-wishlist" : ""}`}
                        title={
                          isInWishlist(product.id)
                            ? "Remove from Wishlist"
                            : "Add to Wishlist"
                        }
                        onClick={handleToggleWishlist}
                      >
                        <i className="icon-heart"></i>
                      </a>
                    </div>
                    <Link
                      href={`/product/${product.slug || product.id}`}
                      className="btn btn-outline-dark"
                      onClick={onClose}
                    >
                      View Full Details
                    </Link>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-5">
                  <p className="text-danger">{error}</p>
                  <button className="btn btn-dark mt-3" onClick={onClose}>
                    Close
                  </button>
                </div>
              ) : (
                <div className="text-center py-5">
                  <p>Product not found.</p>
                  <button className="btn btn-dark mt-3" onClick={onClose}>
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
