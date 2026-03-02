"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useCart } from "@/lib/store/cart-store";
import { formatCurrency } from "@/lib/utils/currency";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, initializeCart } = useCart();

  // Initialize cart from localStorage on mount
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);
  const total = subtotal;


  const handleQuantityChange = (itemId: string, value: string) => {
    const qty = parseInt(value, 10);
    if (!Number.isNaN(qty) && qty >= 1) {
      const item = items.find(i => i.id === itemId);
      updateQuantity(itemId, qty);
      if (item) {
        toast.success(`Quantity updated to ${qty}`, { duration: 2000 });
      }
    }
  };

  return (
    <main className="main">
      <div className="container">
        <ul className="checkout-progress-bar d-flex justify-content-center flex-wrap">
          <li className="active">
            <Link href="/cart">Shopping Cart</Link>
          </li>
          <li>
            <Link href="/checkout">Checkout</Link>
          </li>
          <li className="disabled">
            <a href="#">Order Complete</a>
          </li>
        </ul>

        <div className="row">
          <div className="col-lg-8">
            <div className="cart-table-container">
              <table className="table table-cart">
                <thead>
                  <tr>
                    <th className="thumbnail-col"></th>
                    <th className="product-col">Product</th>
                    <th className="price-col">Price</th>
                    <th className="qty-col">Quantity</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5">
                        <p className="mb-2">Your cart is empty.</p>
                        <Link href="/products" className="btn btn-dark">
                          Continue shopping
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="product-row">
                        <td>
                          <figure className="product-image-container">
                            <Link href={`/product/${item.product.id}`} className="product-image">
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                width={100}
                                height={100}
                              />
                            </Link>
                            <a
                              href="#"
                              className="btn-remove icon-cancel"
                              title="Remove Product"
                              onClick={(e) => {
                                e.preventDefault();
                                removeItem(item.id);
                                toast.success(`${item.product.name} removed from cart`);
                              }}
                            />
                          </figure>
                        </td>
                        <td className="product-col">
                          <h5 className="product-title">
                            <Link href={`/product/${item.product.id}`}>{item.product.name}</Link>
                          </h5>
                          {item.variant && item.variant.attributes && (
                            <div className="product-variant-info mt-1">
                              {Object.entries(item.variant.attributes).map(([key, value]) => (
                                <span key={key} className="badge badge-secondary mr-1">
                                  {key}: {value as string}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>
                          <div className="product-single-qty">
                            <input
                              className="horizontal-quantity form-control"
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="text-right">
                          <span className="subtotal-price">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                <tfoot>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="cart-summary">
              <h3>CART TOTALS</h3>

              <table className="table table-totals">
                <tbody>
                  <tr>
                    <td>Subtotal</td>
                    <td>{formatCurrency(subtotal)}</td>
                  </tr>
                </tbody>

                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td>{formatCurrency(total)}</td>
                  </tr>
                </tfoot>
              </table>

              <div className="checkout-methods">
                <Link href="/checkout" className="btn btn-block btn-dark">
                  Proceed to Checkout
                  <i className="fa fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6"></div>
    </main>
  );
}
