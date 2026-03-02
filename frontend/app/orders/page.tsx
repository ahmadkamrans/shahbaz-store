"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ordersApi, Order } from "@/lib/api/orders";
import { useSiteLoading } from "@/lib/loading-context";
import { formatPrice } from "@/lib/utils";
import { getAuthToken } from "@/lib/api/config";

export default function OrdersPage() {
  const router = useRouter();
  const { setLoading: setSiteLoading } = useSiteLoading();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setSiteLoading(true);
        const ordersData = await ordersApi.getOrders();
        setOrders(ordersData);
      } catch (error: any) {
        setError(error.message || "Failed to load orders");
      } finally {
        setLoading(false);
        setSiteLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const statusColors: Record<string, string> = {
    pending: "warning",
    confirmed: "info",
    shipped: "primary",
    delivered: "success",
    cancelled: "danger",
  };

  if (loading) {
    return null;
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
              My Orders
            </li>
          </ol>
        </nav>

        <h2 className="mb-4">My Orders</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-5">
            <p className="mb-3">You haven't placed any orders yet.</p>
            <Link href="/products" className="btn btn-dark">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card mb-4 p-4 border rounded">
                <div className="row align-items-center">
                  <div className="col-md-3">
                    <h5>Order #{order._id.slice(-8).toUpperCase()}</h5>
                    <p className="text-muted mb-0">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-md-3">
                    <p className="mb-1">
                      <strong>Items:</strong> {order.items.length}
                    </p>
                    <p className="mb-0">
                      <strong>Total:</strong> {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                  <div className="col-md-3">
                    <span className={`badge badge-${statusColors[order.status] || 'secondary'}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="col-md-3 text-right">
                    <Link
                      href={`/orders/${order._id}`}
                      className="btn btn-sm btn-dark"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-top">
                  <div className="row">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="col-md-4 mb-2">
                        <div className="d-flex align-items-center">
                          {item.product?.image && (
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              width={60}
                              height={60}
                              className="mr-2"
                            />
                          )}
                          <div>
                            <small className="d-block">{item.product?.name || "Product"}</small>
                            <small className="text-muted">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="col-md-4">
                        <small className="text-muted">
                          +{order.items.length - 3} more item(s)
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
