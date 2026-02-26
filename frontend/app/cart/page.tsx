"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useCart } from "@/lib/store/cart-store";
import { discountCodesApi } from "@/lib/api/discountCodes";
import { formatCurrency } from "@/lib/utils/currency";

const SHIPPING_FLAT = 10;

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, initializeCart } = useCart();

  // Initialize cart from localStorage on mount
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "flat">("pickup");
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    country: "USA",
    state: "NY",
    city: "",
    zip: "",
  });
  const [addressUpdated, setAddressUpdated] = useState(false);

  const shippingCost = shippingMethod === "flat" ? SHIPPING_FLAT : 0;
  const total = subtotal + shippingCost - discountAmount;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      setValidatingCoupon(true);
      setCouponError("");
      const result = await discountCodesApi.validateDiscountCode(couponCode.trim(), subtotal);
      
      if (result.valid && result.discountAmount) {
        setDiscountAmount(result.discountAmount);
        setCouponError("");
        // Store discount code in localStorage for checkout
        localStorage.setItem('appliedDiscountCode', couponCode.trim().toUpperCase());
        toast.success(`Discount code "${couponCode.trim().toUpperCase()}" applied!`, {
          icon: '🎉',
        });
      } else {
        setCouponError(result.message || "Invalid coupon code");
        setDiscountAmount(0);
        localStorage.removeItem('appliedDiscountCode');
        toast.error(result.message || "Invalid coupon code");
      }
    } catch (error: any) {
      setCouponError(error.message || "Failed to validate coupon code");
      setDiscountAmount(0);
      localStorage.removeItem('appliedDiscountCode');
      toast.error(error.message || "Failed to validate coupon code");
    } finally {
      setValidatingCoupon(false);
    }
  };

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
                  <tr>
                    <td colSpan={5} className="clearfix">
                      <div className="float-left">
                        <div className="cart-discount">
                          <form onSubmit={handleApplyCoupon}>
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Coupon Code"
                                value={couponCode}
                                onChange={(e) => {
                                  setCouponCode(e.target.value);
                                  setCouponError("");
                                  if (discountAmount > 0) {
                                    setDiscountAmount(0);
                                    localStorage.removeItem('appliedDiscountCode');
                                  }
                                }}
                                disabled={validatingCoupon}
                              />
                              <div className="input-group-append">
                                <button
                                  className="btn btn-sm"
                                  type="submit"
                                  disabled={validatingCoupon}
                                >
                                  {validatingCoupon ? "Validating..." : "Apply Coupon"}
                                </button>
                              </div>
                            </div>
                            {couponError && (
                              <div className="text-danger mt-2 small">{couponError}</div>
                            )}
                            {discountAmount > 0 && (
                              <div className="text-success mt-2 small">
                                Coupon applied! Discount: {formatCurrency(discountAmount)}
                              </div>
                            )}
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
                    <td>{formatCurrency(subtotal)}</td>
                  </tr>
                  
                  {discountAmount > 0 && (
                    <tr>
                      <td>Discount</td>
                      <td className="text-success">-{formatCurrency(discountAmount)}</td>
                    </tr>
                  )}

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

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setAddressUpdated(true);
                          setTimeout(() => setAddressUpdated(false), 3000);
                        }}
                      >
                        <div className="form-group form-group-sm">
                          <label>
                            Shipping to <strong>{shippingAddress.state}</strong>
                          </label>
                          <div className="select-custom">
                            <select
                              className="form-control form-control-sm"
                              value={shippingAddress.country}
                              onChange={(e) =>
                                setShippingAddress({ ...shippingAddress, country: e.target.value })
                              }
                            >
                              <option value="USA">United States (US)</option>
                              <option value="Turkey">Turkey</option>
                              <option value="China">China</option>
                              <option value="Germany">Germany</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-group form-group-sm">
                          <div className="select-custom">
                            <select
                              className="form-control form-control-sm"
                              value={shippingAddress.state}
                              onChange={(e) =>
                                setShippingAddress({ ...shippingAddress, state: e.target.value })
                              }
                            >
                              <option value="NY">New York</option>
                              <option value="CA">California</option>
                              <option value="TX">Texas</option>
                              <option value="FL">Florida</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-group form-group-sm">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Town / City"
                            value={shippingAddress.city}
                            onChange={(e) =>
                              setShippingAddress({ ...shippingAddress, city: e.target.value })
                            }
                          />
                        </div>

                        <div className="form-group form-group-sm">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="ZIP"
                            value={shippingAddress.zip}
                            onChange={(e) =>
                              setShippingAddress({ ...shippingAddress, zip: e.target.value })
                            }
                          />
                        </div>

                        {addressUpdated && (
                          <div className="alert alert-success alert-sm mb-2" role="alert">
                            Shipping address updated!
                          </div>
                        )}

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
