"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/lib/store/wishlist-store";
import { useCart } from "@/lib/store/cart-store";
import { useSiteLoading } from "@/lib/loading-context";
import { formatCurrency } from "@/lib/utils/currency";

export default function WishlistPage() {
  const { items, removeItem, fetchWishlist, loading } = useWishlist();
  const { addItem } = useCart();
  const { setLoading: setSiteLoading } = useSiteLoading();

  useEffect(() => {
    setSiteLoading(loading);
  }, [loading, setSiteLoading]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    const product = items.find((p) => p.id === productId);
    if (product) addItem(product);
  };

  const handleRemove = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    try {
      await removeItem(productId);
    } catch (error) {
      alert('Failed to remove item from wishlist');
    }
  };

  return (
    <main className="main">
      <div className="category-banner-container bg-gray">
        <div
          className="category-banner banner text-uppercase"
          style={{
            background:
              "no-repeat 60%/cover url('/assets/images/banners/banner-top.jpg')",
          }}
        >
          <div className="container position-relative">
            <div className="row">
              <div className="pl-lg-5 pb-5 pb-md-0 col-md-5 col-xl-4 col-lg-4 offset-1">
                <h3>
                  My<br></br>Wishlist
                </h3>
                <Link href="/products" className="btn btn-dark">
                  Shop Now
                </Link>
              </div>
              <div className="pl-lg-3 col-md-4 offset-md-0 offset-1 pt-3">
                <div className="coupon-sale-content">
                  <h4 className="m-b-1 coupon-sale-text bg-white text-transform-none">
                    Saved for Later
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <nav aria-label="breadcrumb" className="breadcrumb-nav">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">
                <i className="icon-home"></i>
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Wishlist
            </li>
          </ol>
        </nav>

        <div className="wishlist-title">
          <h2 className="p-2">My wishlist on Shahbaz</h2>
        </div>
        <div className="wishlist-table-container">
          <table className="table table-wishlist mb-0">
            <thead>
              <tr>
                <th className="thumbnail-col"></th>
                <th className="product-col">Product</th>
                <th className="price-col">Price</th>
                <th className="status-col">Stock Status</th>
                <th className="action-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? null : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5">
                    <p className="mb-2">Your wishlist is empty.</p>
                    <Link href="/products" className="btn btn-dark">
                      Continue shopping
                    </Link>
                  </td>
                </tr>
              ) : (
                items.map((product) => (
                  <tr key={product.id} className="product-row">
                    <td>
                      <figure className="product-image-container">
                        <Link
                          href={`/product/${product.slug || product.id}`}
                          className="product-image"
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={100}
                            height={100}
                          />
                        </Link>
                        <a
                          href="#"
                          className="btn-remove icon-cancel"
                          title="Remove Product"
                          onClick={(e) => handleRemove(e, product.id)}
                        />
                      </figure>
                    </td>
                    <td>
                      <h5 className="product-title">
                        <Link href={`/product/${product.slug || product.id}`}>
                          {product.name}
                        </Link>
                      </h5>
                    </td>
                    <td className="price-box">{formatCurrency(product.price)}</td>
                    <td>
                      <span className="stock-status">
                        {product.inStock !== false
                          ? "In stock"
                          : "Out of stock"}
                      </span>
                    </td>
                    <td className="action">
                      <Link
                        href={`/product/${product.slug || product.id}`}
                        className="btn btn-quickview mt-1 mt-md-0"
                        title="Quick View"
                      >
                        Quick View
                      </Link>
                      <button
                        type="button"
                        className="btn btn-dark btn-add-cart product-type-simple btn-shop"
                        onClick={(e) => handleAddToCart(e, product.id)}
                      >
                        ADD TO CART
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
