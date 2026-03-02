"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi, User } from "@/lib/api/auth";
import { useSiteLoading } from "@/lib/loading-context";
import { getAuthToken } from "@/lib/api/config";

export default function AccountPage() {
  const router = useRouter();
  const { setLoading: setSiteLoading } = useSiteLoading();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        setSiteLoading(true);
        const userData = await authApi.getMe();
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: {
            street: userData.address?.street || "",
            city: userData.address?.city || "",
            state: userData.address?.state || "",
            zipCode: userData.address?.zipCode || "",
            country: userData.address?.country || "",
          },
        });
      } catch (error: any) {
        setError(error.message || "Failed to load profile");
      } finally {
        setLoading(false);
        setSiteLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const updatedUser = await authApi.updateProfile(formData);
      setUser(updatedUser);
      setEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (error: any) {
      setError(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <main className="main">
        <div className="container">
          <div className="text-center py-5">
            <p>{error || "Failed to load profile"}</p>
            <Link href="/login" className="btn btn-dark mt-3">
              Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="container">
        <nav aria-label="breadcrumb" className="breadcrumb-nav">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/">
                <i className="icon-home"></i>
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              My Account
            </li>
          </ol>
        </nav>

        <div className="row">
          <div className="col-lg-3 mb-4">
            <div className="account-sidebar">
              <h4 className="mb-3">My Account</h4>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Link href="/account" className="active">
                    Account Details
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/orders">My Orders</Link>
                </li>
                <li className="mb-2">
                  <Link href="/wishlist">Wishlist</Link>
                </li>
                <li className="mb-2">
                  <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-lg-9">
            <h2 className="mb-4">Account Details</h2>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success" role="alert">
                {success}
              </div>
            )}

            {!editing ? (
              <div className="account-details-view">
                <div className="card p-4">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Name:</strong>
                      <p>{user.name}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Email:</strong>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  {user.phone && (
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <strong>Phone:</strong>
                        <p>{user.phone}</p>
                      </div>
                    </div>
                  )}
                  {user.address && (
                    <div className="mb-3">
                      <strong>Address:</strong>
                      <address className="mb-0">
                        {user.address.street && <>{user.address.street}<br /></>}
                        {user.address.city && <>{user.address.city}, </>}
                        {user.address.state} {user.address.zipCode}<br />
                        {user.address.country}
                      </address>
                    </div>
                  )}
                  <button
                    className="btn btn-dark"
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-4">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        Email <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <h5 className="mt-4 mb-3">Address</h5>
                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, city: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address.state}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, state: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>ZIP Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address.zipCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, zipCode: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address.country}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, country: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    className="btn btn-dark mr-2"
                    disabled={saving}
                  >
                    {saving ? "SAVING..." : "SAVE CHANGES"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => {
                      setEditing(false);
                      setError("");
                      setSuccess("");
                      // Reset form data
                      setFormData({
                        name: user.name || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        address: {
                          street: user.address?.street || "",
                          city: user.address?.city || "",
                          state: user.address?.state || "",
                          zipCode: user.address?.zipCode || "",
                          country: user.address?.country || "",
                        },
                      });
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
