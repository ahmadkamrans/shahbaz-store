"use client";

import { useState } from "react";
import { ordersApi, Order } from "../../../lib/api/orders.api";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface OrdersClientProps {
  initialOrders: Order[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  initialStatus: string;
}

export default function OrdersClient({
  initialOrders,
  initialPagination,
  initialStatus,
}: OrdersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orders = initialOrders; // Use props directly, will update on refresh
  const [page, setPage] = useState(initialPagination.page);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const refreshOrders = () => {
    const params = new URLSearchParams();
    if (page > 1) params.append("page", page.toString());
    if (statusFilter) params.append("status", statusFilter);
    router.push(`/orders?${params.toString()}`);
    router.refresh();
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: Order["status"],
  ) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      toast.success("Order status updated successfully!");
      refreshOrders();
      if (selectedOrder?._id === orderId || selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error(
        error.response?.data?.error || "Failed to update order status",
      );
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    router.push(`/orders?${params.toString()}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-custom-blue">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id || order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {(order._id || order.id)?.toString().substring(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {order.customerName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.customerEmail}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.items.length} item(s)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(order.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-custom-blue hover:text-custom-blue-light"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {initialPagination.pages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => {
              const newPage = Math.max(1, page - 1);
              setPage(newPage);
              const params = new URLSearchParams();
              if (newPage > 1) params.append("page", newPage.toString());
              if (statusFilter) params.append("status", statusFilter);
              router.push(`/orders?${params.toString()}`);
            }}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {initialPagination.pages}
          </span>
          <button
            onClick={() => {
              const newPage = Math.min(initialPagination.pages, page + 1);
              setPage(newPage);
              const params = new URLSearchParams();
              if (newPage > 1) params.append("page", newPage.toString());
              if (statusFilter) params.append("status", statusFilter);
              router.push(`/orders?${params.toString()}`);
            }}
            disabled={page === initialPagination.pages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 !m-0">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <p>Name: {selectedOrder.customerName}</p>
                <p>Email: {selectedOrder.customerEmail}</p>
                {selectedOrder.customerPhone && (
                  <p>Phone: {selectedOrder.customerPhone}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Product</th>
                      <th className="text-right py-2">Quantity</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{item.productName}</td>
                        <td className="text-right py-2">{item.quantity}</td>
                        <td className="text-right py-2">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="text-right py-2">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-right font-semibold py-2">
                        Total:
                      </td>
                      <td className="text-right font-semibold py-2">
                        {formatCurrency(selectedOrder.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <p>
                  {selectedOrder.shippingAddress.street},{" "}
                  {selectedOrder.shippingAddress.city}
                </p>
                <p>
                  {selectedOrder.shippingAddress.state}{" "}
                  {selectedOrder.shippingAddress.zipCode}
                </p>
                <p>{selectedOrder.shippingAddress.country}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Update Status</h3>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusUpdate(
                      selectedOrder._id || selectedOrder.id || "",
                      e.target.value as Order["status"],
                    )
                  }
                  className="px-4 py-2 border rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
