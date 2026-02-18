"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/store/cart-store";

const SHIPPING_FLAT = 145.8; // example flat rate

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [loginOpen, setLoginOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [differentShippingOpen, setDifferentShippingOpen] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "flat">(
    "pickup",
  );

  const shippingCost = shippingMethod === "flat" ? SHIPPING_FLAT : 0;
  const total = subtotal + shippingCost;

  return (
    <main className="main main-test">
      <div className="container checkout-container">
        <ul className="checkout-progress-bar d-flex justify-content-center flex-wrap">
          <li>
            <Link href="/cart">Shopping Cart</Link>
          </li>
          <li className="active">
            <Link href="/checkout">Checkout</Link>
          </li>
          <li className="disabled">
            <a href="#">Order Complete</a>
          </li>
        </ul>

        <div className="row">
          <div className="col-lg-7">
            <ul className="checkout-steps">
              <li>
                <h2 className="step-title">Billing details</h2>

                <form
                  action="#"
                  id="checkout-form"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>
                          First name
                          <abbr className="required" title="required">
                            *
                          </abbr>
                        </label>
                        <input type="text" className="form-control" required />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label>
                          Last name
                          <abbr className="required" title="required">
                            *
                          </abbr>
                        </label>
                        <input type="text" className="form-control" required />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Company name (optional)</label>
                    <input type="text" className="form-control" />
                  </div>

                  <div className="select-custom">
                    <label>
                      Country / Region
                      <abbr className="required" title="required">
                        *
                      </abbr>
                    </label>
                    <select name="orderby" className="form-control">
                      <option value="">Vanuatu</option>
                      <option value="1">Brunei</option>
                      <option value="2">Bulgaria</option>
                      <option value="3">Burkina Faso</option>
                      <option value="4">Burundi</option>
                      <option value="5">Cameroon</option>
                    </select>
                  </div>

                  <div className="form-group mb-1 pb-2">
                    <label>
                      Street address
                      <abbr className="required" title="required">
                        *
                      </abbr>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="House number and street name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Apartment, suite, unite, etc. (optional)"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Town / City
                      <abbr className="required" title="required">
                        *
                      </abbr>
                    </label>
                    <input type="text" className="form-control" required />
                  </div>

                  <div className="select-custom">
                    <label>
                      State / County{" "}
                      <abbr className="required" title="required">
                        *
                      </abbr>
                    </label>
                    <select name="orderby" className="form-control">
                      <option value="">NY</option>
                      <option value="1">Brunei</option>
                      <option value="2">Bulgaria</option>
                      <option value="3">Burkina Faso</option>
                      <option value="4">Burundi</option>
                      <option value="5">Cameroon</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Postcode / Zip
                      <abbr className="required" title="required">
                        *
                      </abbr>
                    </label>
                    <input type="text" className="form-control" required />
                  </div>

                  <div className="form-group">
                    <label>
                      Phone{" "}
                      <abbr className="required" title="required">
                        *
                      </abbr>
                    </label>
                    <input type="tel" className="form-control" required />
                  </div>

                  <div className="form-group">
                    <label>
                      Email address
                      <abbr className="required" title="required">
                        *
                      </abbr>
                    </label>
                    <input type="email" className="form-control" required />
                  </div>

                  <div className="form-group mb-1">
                    <div className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="create-account"
                        checked={createAccountOpen}
                        onChange={(e) => setCreateAccountOpen(e.target.checked)}
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="create-account"
                      >
                        Create an account?
                      </label>
                    </div>
                  </div>

                  <div
                    className={createAccountOpen ? "collapse show" : "collapse"}
                  >
                    <div className="form-group">
                      <label>
                        Create account password
                        <abbr className="required" title="required">
                          *
                        </abbr>
                      </label>
                      <input
                        type="password"
                        placeholder="Password"
                        className="form-control"
                        required={createAccountOpen}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="custom-control custom-checkbox mt-0">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="different-shipping"
                        checked={differentShippingOpen}
                        onChange={(e) =>
                          setDifferentShippingOpen(e.target.checked)
                        }
                      />
                      <label
                        className="custom-control-label"
                        htmlFor="different-shipping"
                      >
                        Ship to a different address?
                      </label>
                    </div>
                  </div>

                  <div
                    className={
                      differentShippingOpen ? "collapse show" : "collapse"
                    }
                  >
                    <div className="shipping-info">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>
                              First name{" "}
                              <abbr className="required" title="required">
                                *
                              </abbr>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group">
                            <label>
                              Last name{" "}
                              <abbr className="required" title="required">
                                *
                              </abbr>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Company name (optional)</label>
                        <input type="text" className="form-control" />
                      </div>

                      <div className="select-custom">
                        <label>
                          Country / Region <span className="required">*</span>
                        </label>
                        <select name="orderby" className="form-control">
                          <option value="">Vanuatu</option>
                          <option value="1">Brunei</option>
                          <option value="2">Bulgaria</option>
                          <option value="3">Burkina Faso</option>
                          <option value="4">Burundi</option>
                          <option value="5">Cameroon</option>
                        </select>
                      </div>

                      <div className="form-group mb-1 pb-2">
                        <label>
                          Street address{" "}
                          <abbr className="required" title="required">
                            *
                          </abbr>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="House number and street name"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Apartment, suite, unit, etc. (optional)"
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Town / City{" "}
                          <abbr className="required" title="required">
                            *
                          </abbr>
                        </label>
                        <input type="text" className="form-control" required />
                      </div>

                      <div className="select-custom">
                        <label>
                          State / County{" "}
                          <abbr className="required" title="required">
                            *
                          </abbr>
                        </label>
                        <select name="orderby" className="form-control">
                          <option value="">NY</option>
                          <option value="1">Brunei</option>
                          <option value="2">Bulgaria</option>
                          <option value="3">Burkina Faso</option>
                          <option value="4">Burundi</option>
                          <option value="5">Cameroon</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>
                          Postcode / ZIP{" "}
                          <abbr className="required" title="required">
                            *
                          </abbr>
                        </label>
                        <input type="text" className="form-control" required />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="order-comments">
                      Order notes (optional)
                    </label>
                    <textarea
                      className="form-control"
                      placeholder="Notes about your order, e.g. special notes for delivery."
                      rows={3}
                    />
                  </div>
                </form>
              </li>
            </ul>
          </div>

          <div className="col-lg-5">
            <div className="order-summary">
              <h3>YOUR ORDER</h3>

              <table className="table table-mini-cart">
                <thead>
                  <tr>
                    <th colSpan={2}>Product</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center py-3">
                        Your cart is empty.{" "}
                        <Link href="/products">Continue shopping</Link>
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td className="product-col">
                          <h3 className="product-title">
                            {item.product.name} ×{" "}
                            <span className="product-qty">{item.quantity}</span>
                          </h3>
                        </td>
                        <td className="price-col">
                          <span>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="cart-subtotal">
                    <td>
                      <h4>Subtotal</h4>
                    </td>
                    <td className="price-col">
                      <span>${subtotal.toFixed(2)}</span>
                    </td>
                  </tr>
                  <tr className="order-shipping">
                    <td className="text-left" colSpan={2}>
                      <h4 className="m-b-sm">Shipping</h4>

                      <div className="form-group form-group-custom-control">
                        <div className="custom-control custom-radio d-flex">
                          <input
                            type="radio"
                            className="custom-control-input"
                            name="shipping"
                            checked={shippingMethod === "pickup"}
                            onChange={() => setShippingMethod("pickup")}
                          />
                          <label className="custom-control-label">
                            Local Pickup
                          </label>
                        </div>
                      </div>

                      <div className="form-group form-group-custom-control mb-0">
                        <div className="custom-control custom-radio d-flex mb-0">
                          <input
                            type="radio"
                            name="shipping"
                            className="custom-control-input"
                            checked={shippingMethod === "flat"}
                            onChange={() => setShippingMethod("flat")}
                          />
                          <label className="custom-control-label">
                            Flat Rate
                          </label>
                        </div>
                      </div>
                    </td>
                  </tr>

                  <tr className="order-total">
                    <td>
                      <h4>Total</h4>
                    </td>
                    <td>
                      <b className="total-price">
                        <span>${total.toFixed(2)}</span>
                      </b>
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="payment-methods">
                <h4>Payment methods</h4>
                <div className="info-box with-icon p-0">
                  <p>
                    Sorry, it seems that there are no available payment methods
                    for your state. Please contact us if you require assistance
                    or wish to make alternate arrangements.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-dark btn-place-order"
                form="checkout-form"
              >
                Place order
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
