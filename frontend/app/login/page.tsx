"use client";

import Link from "next/link";

export default function LoginPage() {
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
                  My<br></br>Account
                </h3>
                <Link href="/products" className="btn btn-dark">
                  Shop Now
                </Link>
              </div>
              <div className="pl-lg-3 col-md-4 offset-md-0 offset-1 pt-3">
                <div className="coupon-sale-content">
                  <h4 className="m-b-1 coupon-sale-text bg-white text-transform-none">
                    Login or Register
                  </h4>
                  <h5 className="mb-2 coupon-sale-text d-block ls-10 p-0">
                    {/* <i className="ls-0">Manage your</i> */}
                    <b className="text-dark"> products</b>
                  </h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container login-container">
        <nav aria-label="breadcrumb" className="breadcrumb-nav">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/products">Shop</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              My Account
            </li>
          </ol>
        </nav>

        <div className="row">
          <div className="col-lg-10 mx-auto">
            <div className="row">
              <div className="col-md-6">
                <div className="heading mb-1">
                  <h2 className="title">Login</h2>
                </div>

                <form action="#" onSubmit={(e) => e.preventDefault()}>
                  <label htmlFor="login-email">
                    Username or email address
                    <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input form-wide"
                    id="login-email"
                    required
                  />

                  <label htmlFor="login-password">
                    Password
                    <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-input form-wide"
                    id="login-password"
                    required
                  />

                  <div className="form-footer">
                    <div className="custom-control custom-checkbox mb-0">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="lost-password"
                      />
                      <label
                        className="custom-control-label mb-0"
                        htmlFor="lost-password"
                      >
                        Remember me
                      </label>
                    </div>

                    <Link
                      href="/forgot-password"
                      className="forget-password text-dark form-footer-right"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <button type="submit" className="btn btn-dark btn-md w-100">
                    LOGIN
                  </button>
                </form>
              </div>
              <div className="col-md-6">
                <div className="heading mb-1">
                  <h2 className="title">Register</h2>
                </div>

                <form action="#" onSubmit={(e) => e.preventDefault()}>
                  <label htmlFor="register-email">
                    Email address
                    <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input form-wide"
                    id="register-email"
                    required
                  />

                  <label htmlFor="register-password">
                    Password
                    <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-input form-wide"
                    id="register-password"
                    required
                  />

                  <div className="form-footer mb-2">
                    <button
                      type="submit"
                      className="btn btn-dark btn-md w-100 mr-0"
                    >
                      Register
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
