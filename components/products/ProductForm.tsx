"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import api from "@/lib/api";
import { IProduct } from "@/types";

interface ProductFormProps {
  product?: IProduct; // strongly typed
  onSuccess?: () => void;
}

interface ProductFormState {
  name: string;
  category: string;
  description: string;
  brand: string;
  price: string; // use string for input binding
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
      <div>
        <label className="block font-medium">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Category</label>
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Brand</label>
        <input name="brand" value={form.brand} onChange={handleChange} className="w-full border rounded p-2" />
      </div>
      <div>
        <label className="block font-medium">Price</label>
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Unit</label>
        <input name="unit" value={form.unit} onChange={handleChange} className="w-full border rounded p-2" required />
      </div>
      <div>
        <label className="block font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>
      <div>
        <label className="block font-medium">Images</label>
        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="block mt-2" />
        <div className="flex mt-2 gap-2">
          {previewUrls.map((url, idx) => (
            <img key={idx} src={url} className="h-16 w-16 object-cover rounded border" alt="Preview" />
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
}
