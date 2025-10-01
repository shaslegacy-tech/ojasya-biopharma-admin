"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import api from "@/lib/api";
import { IProduct } from "@/types";

interface ProductFormProps {
  product?: IProduct;
  onSuccess?: () => void;
}

interface ProductFormState {
  name: string;
  category: string;
  description: string;
  brand: string;
  price: string;
  unit: string;
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormState>({
    name: "",
    category: "",
    description: "",
    brand: "",
    price: "",
    unit: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        category: product.category,
        description: product.description || "",
        brand: product.brand || "",
        price: product.price.toString(),
        unit: product.unit,
      });
      setPreviewUrls(product.images || []);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(filesArray);
      const urls = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      images.forEach((img) => formData.append("images", img));

      if (product) {
        await api.put(`/products/${product._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    } finally {
      setLoading(false);
    }
  };

    // inside ProductForm component
    const handleFiles = (files: File[]) => {
      setImages((prev) => [...prev, ...files]);
      setPreviewUrls((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    };

    const removeImage = (index: number) => {
      setImages((prev) => prev.filter((_, i) => i !== index));
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };


  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white w-[700px] max-w-full rounded-3xl shadow-2xl p-8 space-y-6 animate-fade-in transform"
    >
      <h2 className="text-3xl font-bold text-gradient bg-clip-text text-transparent from-[#00bfa6] via-[#0072ff] to-[#00ffd5]">
        {product ? "Edit Product" : "Add Product"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#00bfa6]"
          required
        />
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category"
          className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#00bfa6]"
          required
        />
        <input
          name="brand"
          value={form.brand}
          onChange={handleChange}
          placeholder="Brand"
          className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#00bfa6]"
        />
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#00bfa6]"
          required
        />
        <input
          name="unit"
          value={form.unit}
          onChange={handleChange}
          placeholder="Unit"
          className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#00bfa6]"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="border border-gray-300 rounded-xl p-3 col-span-2 focus:ring-2 focus:ring-[#00bfa6]"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Images</label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#00bfa6] hover:bg-gray-50 transition relative"
          onClick={() => document.getElementById("imageInput")?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) handleFiles(Array.from(e.dataTransfer.files));
          }}
        >
          <svg
            className="w-10 h-10 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4h10v12M5 20h14a2 2 0 002-2v-4H3v4a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">Drag & Drop or Click to Upload</p>
          <button
            type="button"
            className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00bfa6] via-[#0072ff] to-[#00ffd5] text-white hover:scale-105 transition shadow-lg"
            onClick={() => document.getElementById("imageInput")?.click()}
          >
            Choose Files
          </button>
          <input
            id="imageInput"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
          />
        </div>

        {/* Previews */}
        <div className="flex flex-wrap mt-4 gap-3">
          {previewUrls.map((url, idx) => (
            <div key={idx} className="relative group">
              <img
                src={url}
                className="h-24 w-24 object-cover rounded-xl border shadow hover:scale-105 transition transform"
                alt="Preview"
              />
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                onClick={() => removeImage(idx)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onSuccess}
          className="px-5 py-2 rounded-xl border hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-7 py-2 rounded-xl text-white bg-gradient-to-r from-[#00bfa6] via-[#0072ff] to-[#00ffd5] hover:scale-105 transition shadow-lg"
        >
          {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
