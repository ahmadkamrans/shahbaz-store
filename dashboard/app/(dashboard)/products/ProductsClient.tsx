"use client";

import { useState, useEffect } from "react";
import { productsApi, Product } from "../../../lib/api/products.api";
import { categoriesApi, Category } from "../../../lib/api/categories.api";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ImageUpload from "../../../components/ImageUpload";

interface ProductsClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function ProductsClient({
  initialProducts,
  initialCategories,
  initialPagination,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [page, setPage] = useState(initialPagination.page);
  const [totalPages, setTotalPages] = useState(initialPagination.pages);

  // Sync props when they change (from router.refresh())
  useEffect(() => {
    setProducts(initialProducts);
    setCategories(initialCategories);
    setTotalPages(initialPagination.pages);
    setPage(initialPagination.page);
  }, [initialProducts, initialCategories, initialPagination]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: 0,
    oldPrice: "",
    image: "",
    images: [] as string[],
    category: "",
    description: "",
    shortDescription: "",
    inStock: true,
    sku: "",
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");
  const [newImage, setNewImage] = useState("");

  const refreshProducts = () => {
    router.push(`/products?page=${page}`);
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
        price: parseFloat(formData.price.toString()),
        category: formData.category,
        images: formData.images.filter((img) => img.trim() !== ""),
        tags: formData.tags.filter((tag) => tag.trim() !== ""),
      };

      if (editingProduct) {
        await productsApi.update(
          editingProduct._id || editingProduct.id || "",
          productData,
        );
        toast.success("Product updated successfully!");
      } else {
        await productsApi.create(productData);
        toast.success("Product created successfully!");
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      resetForm();
      refreshProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error(error.response?.data?.error || "Failed to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const categoryId =
      typeof product.category === "object"
        ? product.category._id || product.category.id
        : product.category;
    setFormData({
      name: product.name,
      slug: product.slug,
      price: product.price,
      oldPrice: product.oldPrice?.toString() || "",
      image: product.image,
      images: product.images || [],
      category: categoryId || "",
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      inStock: product.inStock ?? true,
      sku: product.sku || "",
      tags: product.tags || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await productsApi.delete(id);
      toast.success("Product deleted successfully!");
      refreshProducts();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.error || "Failed to delete product");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      price: 0,
      oldPrice: "",
      image: "",
      images: [],
      category: "",
      description: "",
      shortDescription: "",
      inStock: true,
      sku: "",
      tags: [],
    });
    setNewTag("");
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, newImage.trim()],
      });
      setNewImage("");
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const getCategoryName = (
    categoryId: string | { _id: string; name: string },
  ) => {
    if (typeof categoryId === "object") return categoryId.name;
    const cat = categories.find(
      (c) => c._id === categoryId || c.id === categoryId,
    );
    return cat?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-custom-blue text-white px-4 py-2 rounded-md hover:bg-custom-blue-light transition-colors"
        >
          Add Product
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-custom-blue">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products && products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id || product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getCategoryName(product.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.inStock
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-custom-blue hover:text-custom-blue-light mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(product._id || product.id || "")
                      }
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No products found. Click "Add Product" to create your first
                  product.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => {
              const newPage = Math.max(1, page - 1);
              setPage(newPage);
              router.push(`/products?page=${newPage}`);
            }}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => {
              const newPage = Math.min(totalPages, page + 1);
              setPage(newPage);
              router.push(`/products?page=${newPage}`);
            }}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Product Modal - Keep the same modal code from before */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 !m-0">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Old Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.oldPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, oldPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <ImageUpload
                  label="Main Image *"
                  currentImage={formData.image}
                  onUpload={(url) => setFormData({ ...formData, image: url })}
                />
                {formData.image && (
                  <input type="hidden" value={formData.image} required />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Images
                </label>
                <ImageUpload
                  multiple
                  onMultipleUpload={(urls) => {
                    setFormData({
                      ...formData,
                      images: [...formData.images, ...urls],
                    });
                  }}
                />
                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Image Previews:
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-24 object-cover rounded border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shortDescription: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Status
                  </label>
                  <select
                    value={formData.inStock ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        inStock: e.target.value === "true",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="true">In Stock</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Tag name"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(idx)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
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
                  {editingProduct ? "Update" : "Create"} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
