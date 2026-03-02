"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ordersApi, Order } from "@/lib/api/orders";
import { useSiteLoading } from "@/lib/loading-context";
import { formatPrice } from "@/lib/utils";
import { getAuthToken } from "@/lib/api/config";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { setLoading: setSiteLoading } = useSiteLoading();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setSiteLoading(true);
        const orderData = await ordersApi.getOrder(orderId);
        setOrder(orderData);
      } catch (error: any) {
        setError(error.message || "Failed to load order");
      } finally {
        setLoading(false);
        setSiteLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router]);

  if (loading) {
    return null;
  }

  if (error || !order) {
    return (
      <main className="main">
        <div className="container">
          <div className="text-center py-5">
            <p>{error || "Order not found"}</p>
            <Link href="/products" className="btn btn-dark mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "warning",
    confirmed: "info",
    shipped: "primary",
    delivered: "success",
    cancelled: "danger",
  };

  return (
    <main className="main">
      <div className="container">
        <ul className="checkout-progress-bar d-flex justify-content-center flex-wrap">
          <li>
            <Link href="/cart">Shopping Cart</Link>
          </li>
          <li>
            <Link href="/checkout">Checkout</Link>
          </li>
          <li className="active">
            <a href="#">Order Complete</a>
          </li>
        </ul>

        <div className="row">
          <div className="col-lg-12">
            <div className="order-success-page">
              <div className="order-success-message text-center mb-4">
                <i className="icon-check-circle" style={{ fontSize: "4rem", color: "#28a745" }}></i>
                <h2 className="mt-3">Thank you for your order!</h2>
                <p className="lead">Your order has been received and is being processed.</p>
                <p className="mb-4">
                  Order Number: <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                </p>
              </div>

              <div className="order-details-card mb-4">
                <h3 className="mb-3">Order Details</h3>
                
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h5>Order Information</h5>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <td><strong>Order ID:</strong></td>
                          <td>{order._id}</td>
                        </tr>
                        <tr>
                          <td><strong>Order Date:</strong></td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                          <td><strong>Status:</strong></td>
                          <td>
                            <span className={`badge badge-${statusColors[order.status] || 'secondary'}`}>
                              {order.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                        {order.discountCode && (
                          <>
                            <tr>
                              <td><strong>Discount Code:</strong></td>
                              <td>
                                {typeof order.discountCode === 'string' 
                                  ? order.discountCode 
                                  : order.discountCode.code || 'N/A'}
                              </td>
                            </tr>
                            {typeof order.discountCode !== 'string' && order.discountCode.type && (
                              <tr>
                                <td><strong>Discount Type:</strong></td>
                                <td>
                                  {order.discountCode.type === 'percentage' 
                                  ? `${order.discountCode.value}% off` 
                                  : `Rs ${order.discountCode.value} off`}
                                </td>
                              </tr>
                            )}
                            {order.discountAmount > 0 && (
                              <tr>
                                <td><strong>Discount Amount:</strong></td>
                                <td className="text-success">
                                  <strong>-{formatPrice(order.discountAmount)}</strong>
                                </td>
                              </tr>
                            )}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="col-md-6">
                    <h5>Shipping Address</h5>
                    <address>
                      {(order.shippingAddress.firstName || order.shippingAddress.lastName) && (
                        <>
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                        </>
                      )}
                      {order.shippingAddress.street}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                      {order.shippingAddress.country}
                      {order.shippingAddress.phone && (
                        <>
                          <br />Phone: {order.shippingAddress.phone}
                        </>
                      )}
                      {order.shippingAddress.email && (
                        <>
                          <br />Email: {order.shippingAddress.email}
                        </>
                      )}
                    </address>
                  </div>
                </div>

                <h5 className="mb-3">Order Items</h5>
                <table className="table table-cart">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            {item.product?.image && (
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                width={80}
                                height={80}
                                className="mr-3"
                              />
                            )}
                            <div>
                              <h6 className="mb-0">{item.product?.name || "Product"}</h6>
                              {item.selectedVariant && (
                                <small className="text-muted">
                                  Variant: {JSON.stringify(item.selectedVariant)}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{formatPrice(item.price)}</td>
                        <td>{item.quantity}</td>
                        <td className="text-right">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    {order.discountAmount > 0 && (
                      <tr>
                        <td colSpan={3} className="text-right">
                          <strong>Discount:</strong>
                        </td>
                        <td className="text-right text-success">
                          <strong>-{formatPrice(order.discountAmount)}</strong>
                        </td>
                      </tr>
                    )}
                    {order.deliveryCharges !== undefined && order.deliveryCharges > 0 && (
                      <tr>
                        <td colSpan={3} className="text-right">
                          <strong>Delivery Charges:</strong>
                        </td>
                        <td className="text-right">
                          <strong>{formatPrice(order.deliveryCharges)}</strong>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="text-right">
                        <strong>Total:</strong>
                      </td>
                      <td className="text-right">
                        <strong>{formatPrice(order.totalAmount)}</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="text-center mb-5">
                <Link href="/products" className="btn btn-dark mr-2">
                  Continue Shopping
                </Link>
                <Link href="/orders" className="btn btn-outline-dark">
                  View All Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
