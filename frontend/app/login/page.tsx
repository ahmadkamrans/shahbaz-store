"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("login-email") as string;
    const password = formData.get("login-password") as string;

    try {
      await authApi.login({ email, password });
      toast.success('Login successful!', {
        icon: '👋',
      });
      router.push("/");
      router.refresh();
    } catch (error: any) {
      const errorMessage = error.message || "Login failed. Please try again.";
      toast.error(errorMessage);
      setLoginError(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess(false);
    setRegisterLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("register-name") as string;
    const email = formData.get("register-email") as string;
    const password = formData.get("register-password") as string;

    try {
      await authApi.register({ name, email, password });
      setRegisterSuccess(true);
      toast.success('Registration successful! Redirecting...', {
        icon: '🎉',
      });
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
      setRegisterError(errorMessage);
    } finally {
      setRegisterLoading(false);
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

                {loginError && (
                  <div className="alert alert-danger" role="alert">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <label htmlFor="login-email">
                    Username or email address
                    <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input form-wide"
                    id="login-email"
                    name="login-email"
                    required
                    disabled={loginLoading}
                  />

                  <label htmlFor="login-password">
                    Password
                    <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-input form-wide"
                    id="login-password"
                    name="login-password"
                    required
                    disabled={loginLoading}
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
                  <button
                    type="submit"
                    className="btn btn-dark btn-md w-100"
                    disabled={loginLoading}
                  >
                    {loginLoading ? "LOGGING IN..." : "LOGIN"}
                  </button>
                </form>
              </div>
              <div className="col-md-6">
                <div className="heading mb-1">
                  <h2 className="title">Register</h2>
                </div>

                {registerError && (
                  <div className="alert alert-danger" role="alert">
                    {registerError}
                  </div>
                )}

                {registerSuccess && (
                  <div className="alert alert-success" role="alert">
                    Registration successful! Redirecting...
                  </div>
                )}

                <form onSubmit={handleRegister}>
                  <label htmlFor="register-name">
                    Name
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input form-wide"
                    id="register-name"
                    name="register-name"
                    required
                    disabled={registerLoading}
                  />

                  <label htmlFor="register-email">
                    Email address
                    <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input form-wide"
                    id="register-email"
                    name="register-email"
                    required
                    disabled={registerLoading}
                  />

                  <label htmlFor="register-password">
                    Password
                    <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-input form-wide"
                    id="register-password"
                    name="register-password"
                    required
                    minLength={6}
                    disabled={registerLoading}
                  />

                  <div className="form-footer mb-2">
                    <button
                      type="submit"
                      className="btn btn-dark btn-md w-100 mr-0"
                      disabled={registerLoading}
                    >
                      {registerLoading ? "REGISTERING..." : "Register"}
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
