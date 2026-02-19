"use client";

import { useState, useRef, useEffect } from "react";
import { uploadApi } from "../lib/api/upload.api";
import { toast } from "sonner";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  label?: string;
  multiple?: boolean;
  onMultipleUpload?: (urls: string[]) => void;
}

export default function ImageUpload({
  onUpload,
  currentImage,
  label = "Upload Image",
  multiple = false,
  onMultipleUpload,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentImage prop changes (only for single image upload)
  useEffect(() => {
    if (!multiple) {
      setPreview(currentImage || null);
    }
  }, [currentImage, multiple]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      if (multiple && onMultipleUpload) {
        // For multiple uploads, don't set preview (just upload)
        const fileArray = Array.from(files);
        const response = await uploadApi.uploadMultipleImages(fileArray);
        onMultipleUpload(response.images.map((img) => img.url));
        toast.success(`${response.images.length} image(s) uploaded successfully!`);
      } else {
        // Single image upload - show preview
        const file = files[0];
        
        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to Cloudinary
        const response = await uploadApi.uploadImage(file);
        onUpload(response.url);
        setPreview(response.url); // Update preview with Cloudinary URL
        toast.success("Image uploaded successfully!");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.error || "Failed to upload image");
      // Reset preview to current image on error
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // For multiple uploads, don't show preview in this component (preview is shown in parent)
  if (multiple) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={true}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="image-upload-multiple"
          />
          <label
            htmlFor="image-upload-multiple"
            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
              uploading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
            }`}
          >
            {uploading ? "Uploading..." : "Upload Images"}
          </label>
          {uploading && (
            <span className="ml-2 text-sm text-gray-500">Please wait...</span>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Supported formats: JPG, PNG, GIF, WebP (Max 10MB per image)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-4">
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="h-24 w-24 object-cover rounded border border-gray-300"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="image-upload-single"
          />
          <label
            htmlFor="image-upload-single"
            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
              uploading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
            }`}
          >
            {uploading ? "Uploading..." : "Choose Image"}
          </label>
          {uploading && (
            <span className="ml-2 text-sm text-gray-500">Please wait...</span>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Supported formats: JPG, PNG, GIF, WebP (Max 10MB)
      </p>
    </div>
  );
}

