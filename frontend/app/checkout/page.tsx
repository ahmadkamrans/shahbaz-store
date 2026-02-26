"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCart } from "@/lib/store/cart-store";
import { ordersApi } from "@/lib/api/orders";
import { getAuthToken } from "@/lib/api/config";
import { formatCurrency } from "@/lib/utils/currency";
import { Country, State, City, ICountry } from "country-state-city";
import { discountCodesApi } from "@/lib/api/discountCodes";

const SHIPPING_FLAT = 145.8; // example flat rate

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [loginOpen, setLoginOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [differentShippingOpen, setDifferentShippingOpen] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "flat">("pickup");
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  // Billing address state
  const [billingCountry, setBillingCountry] = useState<string>("");
  const [billingState, setBillingState] = useState<string>("");
  const [billingCity, setBillingCity] = useState<string>("");
  
  // Shipping address state
  const [shippingCountry, setShippingCountry] = useState<string>("");
  const [shippingState, setShippingState] = useState<string>("");
  const [shippingCity, setShippingCity] = useState<string>("");
  
  // Client-side only data to prevent hydration errors
  const [isMounted, setIsMounted] = useState(false);
  const [countries, setCountries] = useState<ICountry[]>([]);
  
  // Initialize countries on client side only
  useEffect(() => {
    setIsMounted(true);
    setCountries(Country.getAllCountries());
  }, []);
  
  // Get states based on selected country (only on client)
  const billingStates = isMounted && billingCountry ? State.getStatesOfCountry(billingCountry) : [];
  const shippingStates = isMounted && shippingCountry ? State.getStatesOfCountry(shippingCountry) : [];
  
  // Get cities based on selected country and state (only on client)
  const billingCities = isMounted && billingCountry && billingState 
    ? City.getCitiesOfState(billingCountry, billingState) 
    : [];
  const shippingCities = isMounted && shippingCountry && shippingState 
    ? City.getCitiesOfState(shippingCountry, shippingState) 
    : [];

  useEffect(() => {
    if (!getAuthToken()) {
      router.push('/login');
    }
  }, [router]);

  const validateDiscountCode = async (code: string) => {
    if (!code.trim()) {
      setDiscountAmount(0);
      setDiscountCode("");
      localStorage.removeItem('appliedDiscountCode');
      return;
    }

    try {
      setValidatingCoupon(true);
      setCouponError("");
      const result = await discountCodesApi.validateDiscountCode(code.trim(), subtotal);
      
      if (result.valid && result.discountAmount) {
        setDiscountAmount(result.discountAmount);
        setDiscountCode(code.trim().toUpperCase());
        setCouponError("");
        localStorage.setItem('appliedDiscountCode', code.trim().toUpperCase());
      } else {
        setCouponError(result.message || "Invalid coupon code");
        setDiscountAmount(0);
        setDiscountCode("");
        localStorage.removeItem('appliedDiscountCode');
      }
    } catch (error: any) {
      setCouponError(error.message || "Failed to validate coupon code");
      setDiscountAmount(0);
      setDiscountCode("");
      localStorage.removeItem('appliedDiscountCode');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    await validateDiscountCode(couponCode);
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setDiscountCode("");
    setDiscountAmount(0);
    setCouponError("");
    localStorage.removeItem('appliedDiscountCode');
  };

  // Load and validate discount code when component mounts or subtotal changes
  useEffect(() => {
    const savedDiscountCode = localStorage.getItem('appliedDiscountCode');
    if (savedDiscountCode && subtotal > 0) {
      setDiscountCode(savedDiscountCode);
      setCouponCode(savedDiscountCode);
      // Validate the saved discount code
      validateDiscountCode(savedDiscountCode);
    } else if (subtotal === 0) {
      // Clear discount code if cart is empty
      setDiscountCode("");
      setCouponCode("");
      setDiscountAmount(0);
      localStorage.removeItem('appliedDiscountCode');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const shippingCost = shippingMethod === "flat" ? SHIPPING_FLAT : 0;
  const total = subtotal + shippingCost - discountAmount;

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!getAuthToken()) {
      toast.error("Please login to place an order");
      setOrderError("Please login to place an order");
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      setOrderError("Your cart is empty");
      return;
    }

    // Get form element
    const form = e.currentTarget;
    
    // Validate form
    if (!form.checkValidity()) {
      form.reportValidity();
      toast.error("Please fill in all required fields");
      setOrderError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setOrderError("");

      const formData = new FormData(form);
      
      // Get country and state names from ISO codes
      const getCountryName = (isoCode: string) => {
        if (!isMounted || !isoCode) return isoCode;
        const country = countries.find(c => c.isoCode === isoCode);
        return country?.name || isoCode;
      };
      
      const getStateName = (countryCode: string, stateCode: string) => {
        if (!isMounted || !countryCode || !stateCode) return stateCode;
        const states = State.getStatesOfCountry(countryCode);
        const state = states.find(s => s.isoCode === stateCode);
        return state?.name || stateCode;
      };
      
      // Validate and collect shipping address
      const shippingAddress = differentShippingOpen ? {
        street: (formData.get('shipping-street') as string)?.trim() || '',
        city: shippingCity || (formData.get('shipping-city') as string)?.trim() || '',
        state: shippingState ? getStateName(shippingCountry, shippingState) : (formData.get('shipping-state') as string)?.trim() || '',
        zipCode: (formData.get('shipping-zip') as string)?.trim() || '',
        country: shippingCountry ? getCountryName(shippingCountry) : (formData.get('shipping-country') as string)?.trim() || '',
      } : {
        street: (formData.get('street') as string)?.trim() || '',
        city: billingCity || (formData.get('city') as string)?.trim() || '',
        state: billingState ? getStateName(billingCountry, billingState) : (formData.get('state') as string)?.trim() || '',
        zipCode: (formData.get('zip') as string)?.trim() || '',
        country: billingCountry ? getCountryName(billingCountry) : (formData.get('country') as string)?.trim() || '',
      };

      // Validate that country and state are selected
      if (differentShippingOpen) {
        if (!shippingCountry || !shippingState) {
          toast.error("Please select both country and state/province");
          setOrderError("Please select both country and state/province");
          setSubmitting(false);
          return;
        }
      } else {
        if (!billingCountry || !billingState) {
          toast.error("Please select both country and state/province");
          setOrderError("Please select both country and state/province");
          setSubmitting(false);
          return;
        }
      }

      // Validate address fields
      if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
        toast.error("Please fill in all required address fields");
        setOrderError("Please fill in all required address fields");
        setSubmitting(false);
        return;
      }

      // Prepare order items
      const orderItems = items.map(item => {
        // Convert variant to the format expected by backend
        // Backend expects: { variantType: { value: variantValue } }
        let selectedVariant = undefined;
        if (item.variant) {
          if (item.variant.attributes) {
            // Convert attributes Record<string, string> to { variantType: { value: variantValue } }
            const variantObj: Record<string, { value: string }> = {};
            for (const [key, value] of Object.entries(item.variant.attributes)) {
              if (value && typeof value === 'string') {
                variantObj[key] = { value };
              }
            }
            if (Object.keys(variantObj).length > 0) {
              selectedVariant = variantObj;
            }
          }
        }

        return {
          product: item.product.id,
          quantity: item.quantity,
          price: item.price,
          selectedVariant: selectedVariant,
        };
      });

      const orderData = {
        items: orderItems,
        shippingAddress,
        discountCode: discountCode && discountCode.trim() ? discountCode.trim() : undefined,
      };

      console.log('Placing order with data:', orderData);

      const order = await ordersApi.createOrder(orderData);
      
      console.log('Order created:', order);
      
      // Clear discount code from localStorage after successful order
      localStorage.removeItem('appliedDiscountCode');
      clearCart();
      toast.success('Order placed successfully!', {
        icon: '🎉',
        duration: 4000,
      });
      router.push(`/orders/${order._id}`);
    } catch (error: unknown) {
      console.error('Order placement error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message 
          || (error as { message?: string })?.message 
          || "Failed to place order. Please try again.";
      toast.error(errorMessage);
      setOrderError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };


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
                  onSubmit={handlePlaceOrder}
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
                        <input type="text" className="form-control" name="firstName" required />
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
                        <input type="text" className="form-control" name="lastName" required />
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
                    <select 
                      name="country" 
                      className="form-control" 
                      required
                      value={billingCountry}
                      onChange={(e) => {
                        setBillingCountry(e.target.value);
                        setBillingState(""); // Reset state when country changes
                        setBillingCity(""); // Reset city when country changes
                      }}
                      suppressHydrationWarning
                    >
                      <option value="">Select Country</option>
                      {isMounted && countries.map((country) => (
                        <option key={country.isoCode} value={country.isoCode}>
                          {country.name}
                        </option>
                      ))}
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
                      name="street"
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

                  <div className="select-custom">
                    <label>
                      State / Province{" "}
                      <abbr className="required" title="required">
                        *
                      </abbr>
                    </label>
                    <select 
                      name="state" 
                      className="form-control" 
                      required
                      value={billingState}
                      onChange={(e) => {
                        setBillingState(e.target.value);
                        setBillingCity(""); // Reset city when state changes
                      }}
                      disabled={!isMounted || !billingCountry}
                      suppressHydrationWarning
                    >
                      <option value="">Select State / Province</option>
                      {isMounted && billingStates.map((state) => (
                        <option key={state.isoCode} value={state.isoCode}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={isMounted && billingCities.length > 0 ? "select-custom" : "form-group"}>
                    <label>
                      Town / City
                      <abbr className="required" title="required">
                        *
                      </abbr>
                    </label>
                    {isMounted && billingCities.length > 0 ? (
                      <select 
                        name="city" 
                        className="form-control" 
                        required
                        value={billingCity}
                        onChange={(e) => setBillingCity(e.target.value)}
                        disabled={!isMounted || !billingState}
                        suppressHydrationWarning
                      >
                        <option value="">Select City</option>
                        {billingCities.map((city, index) => (
                          <option key={`${city.name}-${index}`} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        className="form-control" 
                        name="city" 
                        required 
                        value={billingCity}
                        onChange={(e) => setBillingCity(e.target.value)}
                        disabled={!isMounted || !billingState}
                        placeholder="Enter city name"
                        suppressHydrationWarning
                      />
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      Postcode / Zip
                      <abbr className="required" title="required">
                        *
                      </abbr>
                    </label>
                    <input type="text" className="form-control" name="zip" required />
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

                  {/* <div className="form-group mb-1">
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
                  </div> */}

                  {createAccountOpen && (
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
                  )}

                  {/* <div className="form-group">
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
                  </div> */}

                  {differentShippingOpen && (
                    <div className="shipping-info" style={{ marginTop: '15px' }}>
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
                              name="shipping-firstName"
                              required={differentShippingOpen}
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
                              name="shipping-lastName"
                              required={differentShippingOpen}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Company name (optional)</label>
                        <input type="text" className="form-control" name="shipping-company" />
                      </div>

                      <div className="select-custom">
                        <label>
                          Country / Region <span className="required">*</span>
                        </label>
                        <select 
                          name="shipping-country" 
                          className="form-control" 
                          required={differentShippingOpen}
                          value={shippingCountry}
                          onChange={(e) => {
                            setShippingCountry(e.target.value);
                            setShippingState(""); // Reset state when country changes
                            setShippingCity(""); // Reset city when country changes
                          }}
                          disabled={!isMounted}
                          suppressHydrationWarning
                        >
                          <option value="">Select Country</option>
                          {isMounted && countries.map((country) => (
                            <option key={country.isoCode} value={country.isoCode}>
                              {country.name}
                            </option>
                          ))}
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
                          name="shipping-street"
                          placeholder="House number and street name"
                          required={differentShippingOpen}
                        />
                      </div>

                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          name="shipping-address2"
                          placeholder="Apartment, suite, unit, etc. (optional)"
                        />
                      </div>

                      <div className="select-custom">
                        <label>
                          State / Province{" "}
                          <abbr className="required" title="required">
                            *
                          </abbr>
                        </label>
                        <select 
                          name="shipping-state" 
                          className="form-control" 
                          required={differentShippingOpen}
                          value={shippingState}
                          onChange={(e) => {
                            setShippingState(e.target.value);
                            setShippingCity(""); // Reset city when state changes
                          }}
                          disabled={!isMounted || !shippingCountry}
                          suppressHydrationWarning
                        >
                          <option value="">Select State / Province</option>
                          {isMounted && shippingStates.map((state) => (
                            <option key={state.isoCode} value={state.isoCode}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={isMounted && shippingCities.length > 0 ? "select-custom" : "form-group"}>
                        <label>
                          Town / City{" "}
                          <abbr className="required" title="required">
                            *
                          </abbr>
                        </label>
                        {isMounted && shippingCities.length > 0 ? (
                          <select 
                            name="shipping-city" 
                            className="form-control" 
                            required={differentShippingOpen}
                            value={shippingCity}
                            onChange={(e) => setShippingCity(e.target.value)}
                            disabled={!isMounted || !shippingState}
                            suppressHydrationWarning
                          >
                            <option value="">Select City</option>
                            {shippingCities.map((city, index) => (
                              <option key={`${city.name}-${index}`} value={city.name}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input 
                            type="text" 
                            className="form-control" 
                            name="shipping-city" 
                            required={differentShippingOpen}
                            value={shippingCity}
                            onChange={(e) => setShippingCity(e.target.value)}
                            disabled={!isMounted || !shippingState}
                            placeholder="Enter city name"
                            suppressHydrationWarning
                          />
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          Postcode / ZIP{" "}
                          <abbr className="required" title="required">
                            *
                          </abbr>
                        </label>
                        <input type="text" className="form-control" name="shipping-zip" required={differentShippingOpen} />
                      </div>
                    </div>
                  )}

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
                            {formatCurrency(item.price * item.quantity)}
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
                      <span>{formatCurrency(subtotal)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-left" colSpan={2}>
                      <div className="cart-discount">
                        {discountCode ? (
                          <div className="mb-2">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-success">
                                <strong>Discount Code: {discountCode}</strong>
                                <span className="ml-2">-{formatCurrency(discountAmount)}</span>
                              </span>
                              <button
                                type="button"
                                onClick={handleRemoveCoupon}
                                className="btn btn-sm btn-link text-danger p-0"
                                style={{ fontSize: '0.875rem' }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={handleApplyCoupon} className="mb-2">
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Coupon Code"
                                value={couponCode}
                                onChange={(e) => {
                                  setCouponCode(e.target.value);
                                  setCouponError("");
                                }}
                                disabled={validatingCoupon}
                              />
                              <div className="input-group-append">
                                <button
                                  className="btn btn-sm btn-dark"
                                  type="submit"
                                  disabled={validatingCoupon || !couponCode.trim()}
                                >
                                  {validatingCoupon ? "..." : "Apply"}
                                </button>
                              </div>
                            </div>
                            {couponError && (
                              <div className="text-danger mt-1 small">{couponError}</div>
                            )}
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                  {discountAmount > 0 && (
                    <tr>
                      <td>
                        <h4>Discount</h4>
                      </td>
                      <td className="price-col text-success">
                        <span>-{formatCurrency(discountAmount)}</span>
                      </td>
                    </tr>
                  )}
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
                        <span>{formatCurrency(total)}</span>
                      </b>
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="payment-methods">
                <h4>Payment methods</h4>
                <div className="info-box with-icon p-0">
                  <p>
                    <strong>Cash on Delivery</strong> - Payment will be collected when your order is delivered.
                  </p>
                </div>
              </div>

              {orderError && (
                <div className="alert alert-danger" role="alert">
                  {orderError}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-dark btn-place-order"
                form="checkout-form"
                disabled={submitting || items.length === 0}
              >
                {submitting ? "Placing order..." : "Place order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
