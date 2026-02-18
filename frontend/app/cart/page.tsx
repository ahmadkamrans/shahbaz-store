"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/store/cart-store";

const SHIPPING_FLAT = 10;

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "flat">("pickup");

  const shippingCost = shippingMethod === "flat" ? SHIPPING_FLAT : 0;
  const total = subtotal + shippingCost;

  const handleQuantityChange = (itemId: string, value: string) => {
    const qty = parseInt(value, 10);
    if (!Number.isNaN(qty) && qty >= 1) updateQuantity(itemId, qty);
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
                              }}
                            />
                          </figure>
                        </td>
                        <td className="product-col">
                          <h5 className="product-title">
                            <Link href={`/product/${item.product.id}`}>{item.product.name}</Link>
                          </h5>
                        </td>
                        <td>${item.price.toFixed(2)}</td>
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
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                <tfoot>
                  <tr>
                    <td colSpan={5} className="clearfix">
                      <div className="float-left">
                        <div className="cart-discount">
                          <form action="#" onSubmit={(e) => e.preventDefault()}>
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Coupon Code"
                              />
                              <div className="input-group-append">
                                <button className="btn btn-sm" type="submit">
                                  Apply Coupon
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>

                      <div className="float-right">
                        <Link href="/cart" className="btn btn-shop btn-update-cart">
                          Update Cart
                        </Link>
                      </div>
                    </td>
                  </tr>
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
                    <td>${subtotal.toFixed(2)}</td>
                  </tr>

                  <tr>
                    <td colSpan={2} className="text-left">
                      <h4>Shipping</h4>

                      <div className="form-group form-group-custom-control">
                        <div className="custom-control custom-radio">
                          <input
                            type="radio"
                            className="custom-control-input"
                            name="shipping"
                            checked={shippingMethod === "pickup"}
                            onChange={() => setShippingMethod("pickup")}
                          />
                          <label className="custom-control-label">Local pickup</label>
                        </div>
                      </div>

                      <div className="form-group form-group-custom-control mb-0">
                        <div className="custom-control custom-radio mb-0">
                          <input
                            type="radio"
                            name="shipping"
                            className="custom-control-input"
                            checked={shippingMethod === "flat"}
                            onChange={() => setShippingMethod("flat")}
                          />
                          <label className="custom-control-label">Flat rate</label>
                        </div>
                      </div>

                      <form action="#" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group form-group-sm">
                          <label>
                            Shipping to <strong>NY.</strong>
                          </label>
                          <div className="select-custom">
                            <select className="form-control form-control-sm">
                              <option value="USA">United States (US)</option>
                              <option value="Turkey">Turkey</option>
                              <option value="China">China</option>
                              <option value="Germany">Germany</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-group form-group-sm">
                          <div className="select-custom">
                            <select className="form-control form-control-sm">
                              <option value="NY">New York</option>
                              <option value="CA">California</option>
                              <option value="TX">Texas</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-group form-group-sm">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Town / City"
                          />
                        </div>

                        <div className="form-group form-group-sm">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="ZIP"
                          />
                        </div>

                        <button type="submit" className="btn btn-shop btn-update-total">
                          Update Totals
                        </button>
                      </form>
                    </td>
                  </tr>
                </tbody>

                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td>${total.toFixed(2)}</td>
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
