"use client";

import { useState, useEffect } from "react";
import {
  discountCodesApi,
  DiscountCode,
} from "../../../lib/api/discountCodes.api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DiscountCodesClientProps {
  initialCodes: DiscountCode[];
}

export default function DiscountCodesClient({
  initialCodes,
}: DiscountCodesClientProps) {
  const router = useRouter();
  const [codes, setCodes] = useState<DiscountCode[]>(initialCodes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    value: 0,
    minOrder: "",
    maxUses: "",
    startDate: "",
    endDate: "",
    active: true,
  });

  useEffect(() => {
    setCodes(initialCodes);
  }, [initialCodes]);

  const refreshCodes = () => {
    router.refresh();
  };

  const resetForm = () => {
    setFormData({
      code: "",
      type: "percent",
      value: 0,
      minOrder: "",
      maxUses: "",
      startDate: "",
      endDate: "",
      active: true,
    });
    setEditingCode(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        value: formData.value,
        minOrder: formData.minOrder ? parseFloat(formData.minOrder) : undefined,
        maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : undefined,
        startDate: formData.startDate || new Date().toISOString().slice(0, 10),
        endDate: formData.endDate || new Date().toISOString().slice(0, 10),
        active: formData.active,
      };
      if (editingCode) {
        await discountCodesApi.update(editingCode.id!, payload);
        toast.success("Discount code updated!");
      } else {
        await discountCodesApi.create(payload);
        toast.success("Discount code created!");
      }
      setIsModalOpen(false);
      resetForm();
      refreshCodes();
    } catch (err) {
      toast.error("Failed to save discount code");
    }
  };

  const handleEdit = (code: DiscountCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      type: code.type,
      value: code.value,
      minOrder: code.minOrder?.toString() ?? "",
      maxUses: code.maxUses?.toString() ?? "",
      startDate: code.startDate?.slice(0, 10) ?? "",
      endDate: code.endDate?.slice(0, 10) ?? "",
      active: code.active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this discount code?")) return;
    try {
      await discountCodesApi.delete(id);
      toast.success("Discount code deleted!");
      refreshCodes();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const displayValue = (c: DiscountCode) =>
    c.type === "percent" ? `${c.value}%` : `$${c.value}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Discount Codes</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-custom-blue text-white px-4 py-2 rounded-md hover:bg-custom-blue-light transition-colors"
        >
          Add Discount Code
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-custom-blue">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Min Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Uses
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Valid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {codes.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No discount codes. Add one to get started.
                </td>
              </tr>
            ) : (
              codes.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {c.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {c.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {displayValue(c)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {c.minOrder != null ? `$${c.minOrder}` : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {c.usedCount ?? 0}/{c.maxUses ?? "∞"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {c.startDate} – {c.endDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        c.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {c.active ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(c)}
                      className="text-custom-blue hover:text-custom-blue-light mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 !m-0">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingCode ? "Edit Discount Code" : "Add Discount Code"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g. SAVE10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "percent" | "fixed",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={formData.type === "percent" ? 1 : 0.01}
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrder: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Uses
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxUses}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUses: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-custom-blue text-white rounded hover:bg-custom-blue-light"
                >
                  {editingCode ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
