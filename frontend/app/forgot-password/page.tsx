"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch, parseResponse } from "@/lib/api/config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // TODO: Update this endpoint when backend password reset is implemented
      const response = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      await parseResponse(response);
      setSuccess(true);
    } catch (error: any) {
      // If endpoint doesn't exist yet, show a helpful message
      if (error.message?.includes("404") || error.message?.includes("Not Found")) {
        setError("Password reset functionality is coming soon. Please contact support for assistance.");
      } else {
        setError(error.message || "Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
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
                  Forgot<br></br>Password
                </h3>
                <Link href="/products" className="btn btn-dark">
                  Shop Now
                </Link>
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
              <Link href="/login">Login</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Forgot Password
            </li>
          </ol>
        </nav>

        <div className="row">
          <div className="col-lg-6 mx-auto">
            <div className="heading mb-1">
              <h2 className="title">Reset Password</h2>
              <p className="text-muted">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {success ? (
              <div className="alert alert-success" role="alert">
                <h4>Check your email!</h4>
                <p>
                  If an account exists with that email, we've sent you a password reset link.
                  Please check your inbox and follow the instructions.
                </p>
                <Link href="/login" className="btn btn-dark mt-3">
                  Back to Login
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <label htmlFor="email">
                    Email address
                    <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input form-wide"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter your email address"
                  />

                  <div className="form-footer">
                    <button
                      type="submit"
                      className="btn btn-dark btn-md w-100"
                      disabled={loading}
                    >
                      {loading ? "SENDING..." : "SEND RESET LINK"}
                    </button>
                  </div>
                </form>

                <div className="text-center mt-3">
                  <Link href="/login" className="forget-password text-dark">
                    <i className="icon-arrow-left"></i> Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
