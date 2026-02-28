"use client";

import { useEffect, useState } from "react";

type Category = {
    id: string;
    name: string;
};

type Product = {
    id: string;
    name: string;
    sku: string;
    categoryId: string;
    category: { name: string };
    brand: string | null;
    stock: number;
    price: number;
    weight: string | null;
    imageUrl: string | null;
    status: string;
};

export default function ProductManagement() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [stockFilter, setStockFilter] = useState("any");

    // UI State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchProducts = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedCategory !== "all") params.append("categoryId", selectedCategory);
            if (stockFilter !== "any") params.append("stockStatus", stockFilter);
            if (search) params.append("search", search);

            const resp = await fetch(`/api/admin/products?${params.toString()}`);
            const data = await resp.json();
            if (resp.ok) {
                setProducts(data.products);
            } else {
                setError(data.error || "Failed to fetch products");
            }
        } catch (err) {
            setError("Network error fetching products");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const resp = await fetch("/api/admin/categories");
            const data = await resp.json();
            if (resp.ok) {
                setCategories(data.categories);
            }
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [selectedCategory, stockFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProducts();
    };

    const handleToggleStatus = async (product: Product) => {
        const newStatus = product.status === "active" ? "draft" : "active";
        try {
            const formData = new FormData();
            formData.append("status", newStatus);
            const resp = await fetch(`/api/admin/products/${product.id}`, { method: "PUT", body: formData });
            if (resp.ok) {
                fetchProducts();
            }
        } catch (err) {
            console.error("Toggle status failed", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            const resp = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
            if (resp.ok) {
                fetchProducts();
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(products.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectItem = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleOpenPanel = (product: Partial<Product> | null = null) => {
        setEditingProduct(product || { name: "", sku: "", categoryId: categories[0]?.id || "", price: 0, stock: 0, status: "active" });
        setPreviewImage(product?.imageUrl || null);
        setSelectedFile(null);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setEditingProduct(null);
        setPreviewImage(null);
        setSelectedFile(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        setSubmitting(true);
        const formData = new FormData();
        formData.append("name", editingProduct.name || "");
        formData.append("sku", editingProduct.sku || "");
        formData.append("categoryId", editingProduct.categoryId || "");
        formData.append("brand", editingProduct.brand || "");
        formData.append("price", String(editingProduct.price || 0));
        formData.append("stock", String(editingProduct.stock || 0));
        formData.append("weight", editingProduct.weight || "");
        formData.append("status", editingProduct.status || "active");
        if (selectedFile) {
            formData.append("file", selectedFile);
        }

        const isUpdate = !!editingProduct.id;
        const url = isUpdate ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products";
        const method = isUpdate ? "PUT" : "POST";

        try {
            const resp = await fetch(url, { method, body: formData });
            if (resp.ok) {
                fetchProducts();
                handleClosePanel();
            } else {
                const data = await resp.json();
                setError(data.error || "Failed to save product");
            }
        } catch (err) {
            setError("Network error saving product");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <section>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-serif italic text-primary">Product Catalog</h2>
                        <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Manage inventories, pricing, and display status</p>
                    </div>
                    <button
                        onClick={() => handleOpenPanel()}
                        className="bg-primary text-white hover:bg-primary-dark px-8 py-3 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add New Product
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white border border-slate-100 shadow-sm p-6 mb-8 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 items-end">
                    <div>
                        <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full bg-slate-50 border-slate-200 focus:ring-1 focus:ring-primary/20 focus:border-primary text-xs tracking-wide p-2"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Stock Status</label>
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="w-full bg-slate-50 border-slate-200 focus:ring-1 focus:ring-primary/20 focus:border-primary text-xs tracking-wide p-2"
                        >
                            <option value="any">Any Status</option>
                            <option value="in-stock">In Stock</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                        </select>
                    </div>
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSearch}>
                            <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Search</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="SEARCH BY NAME OR SKU..."
                                    className="w-full bg-slate-50 border-slate-200 focus:ring-1 focus:ring-primary/20 focus:border-primary text-xs tracking-wide py-2 pl-10 pr-4"
                                />
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            </div>
                        </form>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setSearch(""); setSelectedCategory("all"); setStockFilter("any"); }}
                            className="flex-1 py-2 text-[10px] font-bold tracking-widest uppercase border border-primary/20 text-primary hover:bg-primary/5 transition-all"
                        >
                            Reset
                        </button>
                        <button
                            onClick={fetchProducts}
                            className="flex-1 py-2 text-[10px] font-bold tracking-widest uppercase bg-primary text-white hover:bg-primary-dark transition-all"
                        >
                            Apply
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400">
                                    <th className="py-4 px-6 text-center w-12">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={products.length > 0 && selectedIds.length === products.length}
                                            className="rounded-none border-slate-300 text-primary focus:ring-primary/20"
                                        />
                                    </th>
                                    <th className="py-4 px-6 text-left">Product</th>
                                    <th className="py-4 px-6 text-left">Category</th>
                                    <th className="py-4 px-6 text-left">Stock</th>
                                    <th className="py-4 px-6 text-left">Price</th>
                                    <th className="py-4 px-6 text-left">Weight/Unit</th>
                                    <th className="py-4 px-6 text-left">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={8} className="p-10 text-center text-slate-400 uppercase tracking-widest text-xs">Loading Products...</td></tr>
                                ) : products.length === 0 ? (
                                    <tr><td colSpan={8} className="p-10 text-center text-slate-400 uppercase tracking-widest text-xs">No products found.</td></tr>
                                ) : products.map((prod) => (
                                    <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6 text-center border-b border-slate-50">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(prod.id)}
                                                onChange={() => handleSelectItem(prod.id)}
                                                className="rounded-none border-slate-300 text-primary focus:ring-primary/20"
                                            />
                                        </td>
                                        <td className="py-4 px-6 border-b border-slate-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 flex-shrink-0 p-1">
                                                    {prod.imageUrl ? (
                                                        <img alt={prod.name} className="w-full h-full object-contain mix-blend-multiply" src={prod.imageUrl} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-200"><span className="material-symbols-outlined">inventory_2</span></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-serif italic text-sm text-primary">{prod.name}</p>
                                                    <p className="text-[9px] text-slate-400 tracking-widest uppercase">SKU: {prod.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 border-b border-slate-50 uppercase tracking-wider text-[10px] text-slate-600">
                                            {prod.category?.name}
                                        </td>
                                        <td className="py-4 px-6 border-b border-slate-50">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${prod.stock === 0 ? "bg-red-100 text-red-700" :
                                                    prod.stock <= 10 ? "bg-amber-100 text-amber-700" :
                                                        "bg-green-100 text-green-700"
                                                }`}>
                                                {prod.stock === 0 ? "Out of Stock" : prod.stock <= 10 ? `Low Stock (${prod.stock})` : `In Stock (${prod.stock})`}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 border-b border-slate-50 text-xs text-slate-600">
                                            ${prod.price.toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6 border-b border-slate-50 text-xs text-slate-500">
                                            {prod.weight || "-"}
                                        </td>
                                        <td className="py-4 px-6 border-b border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={prod.status === "active"} onChange={() => handleToggleStatus(prod)} className="sr-only peer" />
                                                    <div className="w-8 h-4 bg-slate-200 rounded-full transition-colors duration-200 peer-checked:bg-green-500 after:content-[''] after:absolute after:left-[2px] after:top-[2px] after:bg-white after:w-3 after:h-3 after:rounded-full after:transition-transform peer-checked:after:translate-x-4"></div>
                                                </label>
                                                <span className="text-[9px] font-bold uppercase text-slate-400">{prod.status}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 border-b border-slate-50 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenPanel(prod)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 transition-all"><span className="material-symbols-outlined text-lg">edit_note</span></button>
                                                <button onClick={() => handleDelete(prod.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><span className="material-symbols-outlined text-lg">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-white border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Showing {products.length} Products</p>
                        <div className="flex gap-2">
                            <button disabled className="px-3 py-1 border border-slate-100 text-slate-300"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                            <button className="px-3 py-1 bg-primary text-white text-[10px] font-bold shadow-sm">1</button>
                            <button disabled className="px-3 py-1 border border-slate-100 text-slate-300"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bulk Action Toolbar */}
            {selectedIds.length > 0 && (
                <div className="bg-primary/95 text-white p-4 flex items-center justify-between sticky bottom-10 z-30 shadow-2xl">
                    <div className="flex items-center gap-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-frosted-blue">{selectedIds.length} Products Selected</p>
                        <div className="h-4 w-[1px] bg-white/10"></div>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-frosted-blue transition-colors">
                                <span className="material-symbols-outlined text-sm">visibility_off</span> Hide from Site
                            </button>
                            <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-300 hover:text-red-400 transition-colors">
                                <span className="material-symbols-outlined text-sm">delete</span> Delete
                            </button>
                        </div>
                    </div>
                    <button className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase bg-white text-primary hover:bg-frosted-blue transition-colors">Export Selection</button>
                </div>
            )}

            {/* Slide Panel Editor */}
            {isPanelOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] transition-opacity" onClick={handleClosePanel} />
            )}
            <div className={`fixed right-0 top-0 h-full w-full max-w-[450px] bg-white shadow-2xl z-[60] border-l border-slate-100 transition-transform duration-500 transform ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-slate-50/50">
                    <h3 className="text-xl font-serif italic text-primary">{editingProduct?.id ? "Edit Product" : "Add New Product"}</h3>
                    <button onClick={handleClosePanel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <span className="material-symbols-outlined font-light">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-160px)]">
                    <div>
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-4">Product Image</label>
                        <div className="relative group">
                            <div className="w-full h-56 bg-white rounded-none flex items-center justify-center border border-dashed border-slate-200 group-hover:border-primary/40 transition-all overflow-hidden p-8">
                                {previewImage ? (
                                    <img alt="Preview" className="w-full h-full object-contain mix-blend-multiply" src={previewImage} />
                                ) : (
                                    <span className="material-symbols-outlined text-5xl text-primary/10">add_photo_alternate</span>
                                )}
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <label className="bg-white px-4 py-2 text-[9px] font-bold uppercase tracking-widest shadow-sm cursor-pointer hover:bg-slate-50">
                                        {previewImage ? "Replace Image" : "Upload Image"}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Product Name</label>
                            <input required className="w-full bg-slate-50 border-slate-200 focus:ring-1 focus:ring-primary/20 focus:border-primary text-lg font-serif italic p-3 outline-none" type="text" value={editingProduct?.name || ""} onChange={e => setEditingProduct(prev => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">SKU</label>
                            <input required className="w-full bg-slate-50 border-slate-200 p-3 text-xs outline-none" type="text" value={editingProduct?.sku || ""} onChange={e => setEditingProduct(prev => ({ ...prev, sku: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Category</label>
                            <select required className="w-full bg-slate-50 border-slate-200 p-3 text-xs outline-none" value={editingProduct?.categoryId || ""} onChange={e => setEditingProduct(prev => ({ ...prev, categoryId: e.target.value }))}>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Price ($)</label>
                            <input required className="w-full bg-slate-50 border-slate-200 p-3 text-xs outline-none" type="number" step="0.01" value={editingProduct?.price || 0} onChange={e => setEditingProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Stock</label>
                            <input required className="w-full bg-slate-50 border-slate-200 p-3 text-xs outline-none" type="number" value={editingProduct?.stock || 0} onChange={e => setEditingProduct(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))} />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Weight/Unit</label>
                            <input className="w-full bg-slate-50 border-slate-200 p-3 text-xs outline-none" type="text" placeholder="1.0 kg" value={editingProduct?.weight || ""} onChange={e => setEditingProduct(prev => ({ ...prev, weight: e.target.value }))} />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Status</label>
                            <select className="w-full bg-slate-50 border-slate-200 p-3 text-xs outline-none" value={editingProduct?.status || "active"} onChange={e => setEditingProduct(prev => ({ ...prev, status: e.target.value }))}>
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-8 bg-white border-t border-slate-100 flex gap-4">
                        <button type="button" onClick={handleClosePanel} className="flex-1 py-4 text-[10px] font-bold tracking-widest uppercase border border-primary/20 text-primary hover:bg-primary/5 transition-all">Discard</button>
                        <button type="submit" disabled={submitting} className="flex-1 py-4 text-[10px] font-bold tracking-widest uppercase bg-primary text-white hover:bg-primary-dark transition-all disabled:opacity-50">{submitting ? "Saving..." : "Save Product"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
