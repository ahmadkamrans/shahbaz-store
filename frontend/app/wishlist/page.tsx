"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/lib/store/wishlist-store";
import { useCart } from "@/lib/store/cart-store";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    const product = items.find((p) => p.id === productId);
    if (product) addItem(product);
  };

  const handleRemove = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    removeItem(productId);
  };

  return (
    <main className="main">
      <div className="page-header">
        <div className="container d-flex flex-column align-items-center">
          <nav aria-label="breadcrumb" className="breadcrumb-nav">
            <div className="container">
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
            </div>
          </nav>

          <h1>Wishlist</h1>
        </div>
      </div>

      <div className="container">
        <div className="wishlist-title">
          <h2 className="p-2">My wishlist on Porto Shop 4</h2>
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
              {items.length === 0 ? (
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
                        <Link href={`/product/${product.id}`} className="product-image">
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
                        <Link href={`/product/${product.id}`}>{product.name}</Link>
                      </h5>
                    </td>
                    <td className="price-box">${product.price.toFixed(2)}</td>
                    <td>
                      <span className="stock-status">
                        {product.inStock !== false ? "In stock" : "Out of stock"}
                      </span>
                    </td>
                    <td className="action">
                      <Link
                        href={`/product/${product.id}`}
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
