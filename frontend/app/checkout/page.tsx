"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCart } from "@/lib/store/cart-store";
import { ordersApi } from "@/lib/api/orders";
import { getAuthToken } from "@/lib/api/config";
import { formatCurrency } from "@/lib/utils/currency";
import { Country, State, City, ICountry } from "country-state-city";
import { discountCodesApi } from "@/lib/api/discountCodes";
import { authApi, User } from "@/lib/api/auth";
import { settingsApi } from "@/lib/api/settings";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [loginOpen, setLoginOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [differentShippingOpen, setDifferentShippingOpen] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "flat">("flat");
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Billing address state
  const [billingCountry, setBillingCountry] = useState<string>("PK"); // Default to Pakistan
  const [billingState, setBillingState] = useState<string>("");
  const [billingCity, setBillingCity] = useState<string>("");

  // Form field state for controlled inputs
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  const [zip, setZip] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  
  // Shipping address state
  const [shippingCountry, setShippingCountry] = useState<string>("PK"); // Default to Pakistan
  const [shippingState, setShippingState] = useState<string>("");
  const [shippingCity, setShippingCity] = useState<string>("");
  const [shippingFirstName, setShippingFirstName] = useState<string>("");
  const [shippingLastName, setShippingLastName] = useState<string>("");
  const [shippingStreet, setShippingStreet] = useState<string>("");
  const [shippingZip, setShippingZip] = useState<string>("");
  const [shippingPhone, setShippingPhone] = useState<string>("");
  const [shippingEmail, setShippingEmail] = useState<string>("");
  
  // Client-side only data to prevent hydration errors
  const [isMounted, setIsMounted] = useState(false);
  const [countries, setCountries] = useState<ICountry[]>([]);

  // User profile data
  const [user, setUser] = useState<User | null>(null);
  
  // Delivery charges settings
  const [deliveryCharges, setDeliveryCharges] = useState<number>(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(0);
  
  // Initialize countries on client side only
  useEffect(() => {
    setIsMounted(true);
    setCountries(Country.getAllCountries());
    
    // Load delivery charges settings
    const loadDeliverySettings = async () => {
      try {
        const settings = await settingsApi.get();
        if (settings.deliveryCharges) {
          setDeliveryCharges(settings.deliveryCharges.amount || 0);
          setFreeDeliveryThreshold(settings.deliveryCharges.freeDeliveryThreshold || 0);
          console.log('Delivery settings loaded:', {
            amount: settings.deliveryCharges.amount || 0,
            threshold: settings.deliveryCharges.freeDeliveryThreshold || 0
          });
        } else {
          console.log('No delivery charges settings found');
        }
      } catch (error) {
        console.error('Failed to load delivery settings:', error);
      }
    };
    
    loadDeliverySettings();
    
    // Load saved form data from localStorage
    const savedFormData = localStorage.getItem('checkoutFormData');
    if (savedFormData && !getAuthToken()) {
      try {
        const formData = JSON.parse(savedFormData);
        if (formData.firstName) setFirstName(formData.firstName);
        if (formData.lastName) setLastName(formData.lastName);
        if (formData.email) setEmail(formData.email);
        if (formData.phone) setPhone(formData.phone);
        if (formData.street) setStreet(formData.street);
        if (formData.zip) setZip(formData.zip);
        if (formData.billingState) setBillingState(formData.billingState);
        if (formData.billingCity) setBillingCity(formData.billingCity);
      } catch (error) {
        console.error('Failed to load saved form data:', error);
      }
    }
  }, []);
  
  // Save form data to localStorage when fields change (only if not logged in)
  useEffect(() => {
    if (!getAuthToken() && isMounted) {
      const formData = {
        firstName,
        lastName,
        email,
        phone,
        street,
        zip,
        billingState,
        billingCity,
      };
      localStorage.setItem('checkoutFormData', JSON.stringify(formData));
    }
  }, [firstName, lastName, email, phone, street, zip, billingState, billingCity, isMounted]);

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!getAuthToken() || !isMounted || countries.length === 0) {
        return;
      }

      try {
        const userData = await authApi.getMe();
        console.log("Loaded user profile:", userData);
        setUser(userData);

        // Pre-fill form fields with user data
        if (userData.name) {
          const nameParts = userData.name.split(" ");
          setFirstName(nameParts[0] || "");
          setLastName(nameParts.slice(1).join(" ") || "");
        }

        if (userData.email) {
          setEmail(userData.email);
        }

        if (userData.phone) {
          setPhone(userData.phone);
        }

        // Pre-fill billing address if available
        if (userData.address) {
          const address = userData.address;
          console.log("Loading address from profile:", address);

          if (address.street) {
            setStreet(address.street);
          }

          if (address.zipCode) {
            setZip(address.zipCode);
          }
          
          // Country is fixed to Pakistan (PK), but we can still load state and city
          // Find state by name (using PK as country)
          if (address.state) {
            const states = State.getStatesOfCountry("PK");
            const state = states.find(
              s => s.name.toLowerCase() === address.state?.toLowerCase() ||
                   s.isoCode.toLowerCase() === address.state?.toLowerCase()
            );
            if (state) {
              setBillingState(state.isoCode);
              
              // Find city
              if (address.city) {
                setBillingCity(address.city);
              }
            }
          }
        } else {
          console.log("No address found in user profile");
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };

    loadUserProfile();
  }, [isMounted, countries]);

  // Get states based on selected country (only on client)
  const billingStates =
    isMounted && billingCountry ? State.getStatesOfCountry(billingCountry) : [];
  const shippingStates =
    isMounted && shippingCountry
      ? State.getStatesOfCountry(shippingCountry)
      : [];

  // Get cities based on selected country and state (only on client)
  const billingCities =
    isMounted && billingCountry && billingState
      ? City.getCitiesOfState(billingCountry, billingState)
      : [];
  const shippingCities =
    isMounted && shippingCountry && shippingState
      ? City.getCitiesOfState(shippingCountry, shippingState)
      : [];

  // Removed redirect to login - users can checkout without login if they create an account

  const validateDiscountCode = async (code: string) => {
    if (!code.trim()) {
      setDiscountAmount(0);
      setDiscountCode("");
      localStorage.removeItem("appliedDiscountCode");
      return;
    }

    try {
      setValidatingCoupon(true);
      setCouponError("");
      const result = await discountCodesApi.validateDiscountCode(
        code.trim(),
        subtotal,
      );

      if (result.valid && result.discountAmount) {
        setDiscountAmount(result.discountAmount);
        setDiscountCode(code.trim().toUpperCase());
        setCouponError("");
        localStorage.setItem("appliedDiscountCode", code.trim().toUpperCase());
      } else {
        setCouponError(result.message || "Invalid coupon code");
        setDiscountAmount(0);
        setDiscountCode("");
        localStorage.removeItem("appliedDiscountCode");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to validate coupon code";
      setCouponError(errorMessage);
      setDiscountAmount(0);
      setDiscountCode("");
      localStorage.removeItem("appliedDiscountCode");
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
    localStorage.removeItem("appliedDiscountCode");
  };

  // Load and validate discount code when component mounts or subtotal changes
  useEffect(() => {
    const savedDiscountCode = localStorage.getItem("appliedDiscountCode");
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
      localStorage.removeItem("appliedDiscountCode");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  // Calculate delivery charges - use useMemo to recalculate when dependencies change
  const shippingCost = useMemo(() => {
    if (shippingMethod === "pickup") {
      return 0;
    }
    // Free delivery if subtotal (after discount) meets threshold
    const subtotalAfterDiscount = subtotal - discountAmount;
    if (freeDeliveryThreshold > 0 && subtotalAfterDiscount >= freeDeliveryThreshold) {
      return 0;
    }
    // Otherwise, apply delivery charges
    return deliveryCharges || 0;
  }, [shippingMethod, subtotal, discountAmount, freeDeliveryThreshold, deliveryCharges]);
  
  const total = subtotal + shippingCost - discountAmount;

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error("Your cart is empty");
      setOrderError("Your cart is empty");
      return;
    }

    // If user is not logged in, they must create an account
    if (!getAuthToken()) {
      if (!createAccountOpen) {
        toast.error("Please check 'Create an account' to place an order");
        setOrderError("Please check 'Create an account' and provide a password");
        return;
      }
      if (!password || password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        setOrderError("Password must be at least 6 characters long");
        return;
      }
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

      // Create account first if user wants to create one
      if (createAccountOpen && !getAuthToken()) {
        try {
          const fullName = `${firstName.trim()} ${lastName.trim()}`;
          if (!fullName.trim() || fullName.trim().length < 2) {
            throw new Error("Name must be at least 2 characters long");
          }
          
          await authApi.register({
            name: fullName,
            email: email.trim(),
            password: password,
          });
          
          toast.success("Account created successfully!");
        } catch (error: unknown) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : "Failed to create account. Please try again.";
          toast.error(errorMessage);
          setOrderError(errorMessage);
          setSubmitting(false);
          return;
        }
      }

      const formData = new FormData(form);

      // Get country and state names from ISO codes
      const getCountryName = (isoCode: string) => {
        if (!isMounted || !isoCode) return isoCode;
        const country = countries.find((c) => c.isoCode === isoCode);
        return country?.name || isoCode;
      };

      const getStateName = (countryCode: string, stateCode: string) => {
        if (!isMounted || !countryCode || !stateCode) return stateCode;
        const states = State.getStatesOfCountry(countryCode);
        const state = states.find((s) => s.isoCode === stateCode);
        return state?.name || stateCode;
      };
      
      // Collect billing address (always from billing form fields)
      const billingAddress = {
        firstName: firstName.trim() || '',
        lastName: lastName.trim() || '',
        street: street.trim() || '',
        city: billingCity.trim() || '',
        state: billingState ? getStateName(billingCountry, billingState) : '',
        zipCode: zip.trim() || '',
        country: billingCountry ? getCountryName(billingCountry) : '',
        phone: phone.trim() || '',
        email: email.trim() || '',
      };

      // Validate and collect shipping address
      const shippingAddress = differentShippingOpen ? {
        firstName: shippingFirstName.trim() || '',
        lastName: shippingLastName.trim() || '',
        street: shippingStreet.trim() || '',
        city: shippingCity.trim() || '',
        state: shippingState ? getStateName(shippingCountry, shippingState) : '',
        zipCode: shippingZip.trim() || '',
        country: shippingCountry ? getCountryName(shippingCountry) : '',
        phone: shippingPhone.trim() || '',
        email: shippingEmail.trim() || '',
      } : billingAddress; // Use billing address if same

      // Validate that country and state are selected
      if (differentShippingOpen) {
        if (!shippingCountry || !shippingState) {
          toast.error("Please select both country and state/province for shipping address");
          setOrderError("Please select both country and state/province for shipping address");
          setSubmitting(false);
          return;
        }
        if (!shippingStreet || !shippingCity || !shippingZip) {
          toast.error("Please fill in all required shipping address fields");
          setOrderError("Please fill in all required shipping address fields");
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
      if (
        !shippingAddress.street ||
        !shippingAddress.city ||
        !shippingAddress.state ||
        !shippingAddress.zipCode ||
        !shippingAddress.country
      ) {
        toast.error("Please fill in all required address fields");
        setOrderError("Please fill in all required address fields");
        setSubmitting(false);
        return;
      }

      // Prepare order items
      const orderItems = items.map((item) => {
        // Convert variant to the format expected by backend
        // Backend expects: { variantType: { value: variantValue } }
        let selectedVariant = undefined;
        if (item.variant) {
          if (item.variant.attributes) {
            // Convert attributes Record<string, string> to { variantType: { value: variantValue } }
            const variantObj: Record<string, { value: string }> = {};
            for (const [key, value] of Object.entries(
              item.variant.attributes,
            )) {
              if (value && typeof value === "string") {
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
        billingAddress,
        shippingAddress,
        discountCode: discountCode && discountCode.trim() ? discountCode.trim() : undefined,
        deliveryCharges: shippingCost,
      };

      console.log("Placing order with data:", orderData);

      const order = await ordersApi.createOrder(orderData);

      console.log("Order created:", order);

      // Save billing address to user profile for future checkouts
      try {
        const billingAddress = {
          street: street.trim() || "",
          city: billingCity.trim() || "",
          state: billingState ? getStateName(billingCountry, billingState) : "",
          zipCode: zip.trim() || "",
          country: billingCountry ? getCountryName(billingCountry) : "",
        };

        // Also save name, email, and phone if provided
        const profileUpdate: Partial<User> = {
          address: billingAddress,
        };

        if (firstName.trim() && lastName.trim()) {
          profileUpdate.name = `${firstName.trim()} ${lastName.trim()}`;
        }

        if (email.trim()) {
          profileUpdate.email = email.trim();
        }

        if (phone.trim()) {
          profileUpdate.phone = phone.trim();
        }

        // Update user profile with checkout information
        console.log("Saving profile update:", profileUpdate);
        const updatedUser = await authApi.updateProfile(profileUpdate);
        console.log("Profile updated successfully:", updatedUser);
        setUser(updatedUser); // Refresh user data
      } catch (error) {
        // Don't fail the order if profile update fails, just log it
        console.error("Failed to save address to profile:", error);
      }
      
      // Clear discount code and form data from localStorage after successful order
      localStorage.removeItem('appliedDiscountCode');
      localStorage.removeItem('checkoutFormData');
      clearCart();
      toast.success("Order placed successfully!", {
        icon: "🎉",
        duration: 4000,
      });
      router.push(`/orders/${order._id}`);
    } catch (error: unknown) {
      console.error("Order placement error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : (
              error as {
                response?: { data?: { message?: string } };
                message?: string;
              }
            )?.response?.data?.message ||
            (error as { message?: string })?.message ||
            "Failed to place order. Please try again.";
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

                <form action="#" id="checkout-form" onSubmit={handlePlaceOrder}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>
                          First name
                          <abbr className="required" title="required">
                            *
                          </abbr>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="firstName"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
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
                        <input
                          type="text"
                          className="form-control"
                          name="lastName"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
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
                      disabled
                      suppressHydrationWarning
                    >
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
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
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
                      {isMounted &&
                        billingStates.map((state) => (
                          <option key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div
                    className={
                      isMounted && billingCities.length > 0
                        ? "select-custom"
                        : "form-group"
                    }
                  >
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
                          <option
                            key={`${city.name}-${index}`}
                            value={city.name}
                          >
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
                    <input
                      type="text"
                      className="form-control"
                      name="zip"
                      required
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Phone{" "}
                      <abbr className="required" title="required">
                        *
                      </abbr>
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Email address
                      <abbr className="required" title="required">
                        *
                      </abbr>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {!getAuthToken() && (
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
                          Create an account? <small className="text-muted">(Required to place order)</small>
                        </label>
                      </div>
                      <small className="text-muted d-block mt-1">
                        An account is required to place an order. Your information will be saved for faster checkout next time.
                      </small>
                    </div>
                  )}

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
                        placeholder="Password (minimum 6 characters)"
                        className="form-control"
                        required={createAccountOpen}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                      />
                      {password && password.length < 6 && (
                        <small className="text-danger">
                          Password must be at least 6 characters long
                        </small>
                      )}
                    </div>
                  )}

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

                  {differentShippingOpen && (
                    <div className="shipping-info" style={{ marginTop: '15px' }}>
                      <h3 className="step-title mb-3">Shipping details</h3>
                      
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>
                              First name
                              <abbr className="required" title="required">
                                *
                              </abbr>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="shipping-firstName"
                              required={differentShippingOpen}
                              value={shippingFirstName}
                              onChange={(e) => setShippingFirstName(e.target.value)}
                            />
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
                            <input
                              type="text"
                              className="form-control"
                              name="shipping-lastName"
                              required={differentShippingOpen}
                              value={shippingLastName}
                              onChange={(e) => setShippingLastName(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="select-custom">
                        <label>
                          Country / Region
                          <abbr className="required" title="required">
                            *
                          </abbr>
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
                          disabled
                          suppressHydrationWarning
                        >
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
                          name="shipping-street"
                          placeholder="House number and street name"
                          required={differentShippingOpen}
                          value={shippingStreet}
                          onChange={(e) => setShippingStreet(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          name="shipping-address2"
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
                          {isMounted &&
                            shippingStates.map((state) => (
                              <option key={state.isoCode} value={state.isoCode}>
                                {state.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div
                        className={
                          isMounted && shippingCities.length > 0
                            ? "select-custom"
                            : "form-group"
                        }
                      >
                        <label>
                          Town / City
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
                              <option
                                key={`${city.name}-${index}`}
                                value={city.name}
                              >
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
                          Postcode / Zip
                          <abbr className="required" title="required">
                            *
                          </abbr>
                        </label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="shipping-zip" 
                          required={differentShippingOpen}
                          value={shippingZip}
                          onChange={(e) => setShippingZip(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Phone{" "}
                          <abbr className="required" title="required">
                            *
                          </abbr>
                        </label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          name="shipping-phone"
                          required={differentShippingOpen}
                          value={shippingPhone}
                          onChange={(e) => setShippingPhone(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Email address
                          <abbr className="required" title="required">
                            *
                          </abbr>
                        </label>
                        <input 
                          type="email" 
                          className="form-control" 
                          name="shipping-email"
                          required={differentShippingOpen}
                          value={shippingEmail}
                          onChange={(e) => setShippingEmail(e.target.value)}
                        />
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
                  {!isMounted ? (
                    <tr>
                      <td colSpan={2} className="text-center py-3">
                        Loading...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
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
                                <span className="ml-2">
                                  -{formatCurrency(discountAmount)}
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={handleRemoveCoupon}
                                className="btn btn-sm btn-link text-danger p-0"
                                style={{ fontSize: "0.875rem" }}
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
                                className="form-control form-control-sm w-100"
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
                                  disabled={
                                    validatingCoupon || !couponCode.trim()
                                  }
                                >
                                  {validatingCoupon ? "..." : "Apply"}
                                </button>
                              </div>
                            </div>
                            {couponError && (
                              <div className="text-danger mt-1 small">
                                {couponError}
                              </div>
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
                            Local Pickup (Free)
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
                            Delivery
                            {shippingCost > 0 ? ` (${formatCurrency(shippingCost)})` : ' (Free)'}
                            {freeDeliveryThreshold > 0 && subtotal - discountAmount < freeDeliveryThreshold && (
                              <div className="d-block mt-2" style={{ fontSize: '1rem', fontWeight: '600', color: '#28a745' }}>
                                <i className="fas fa-info-circle mr-1"></i>
                                Free delivery on orders over {formatCurrency(freeDeliveryThreshold)}
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  <tr>
                    <td>
                      <h4>Delivery Charges</h4>
                    </td>
                    <td className="price-col">
                      <span>
                        {shippingCost > 0 ? formatCurrency(shippingCost) : 'Free'}
                      </span>
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
                    <strong>Cash on Delivery</strong> - Payment will be
                    collected when your order is delivered.
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
