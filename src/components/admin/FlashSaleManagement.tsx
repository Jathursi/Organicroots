"use client";

import { useEffect, useState } from "react";

type Product = {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    category: { name: string };
};

type FlashSaleProduct = {
    id?: string;
    productId: string;
    price: number;
    discount?: number;
    product?: Product;
};

type FlashSale = {
    id: string;
    title: string;
    subtitle: string | null;
    expiresAt: string;
    isActive: boolean;
    products: FlashSaleProduct[];
};

export default function FlashSaleManagement() {
    const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI State
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingSale, setEditingSale] = useState<Partial<FlashSale> | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchFlashSales = async () => {
        try {
            const resp = await fetch("/api/admin/flash-sales");
            const data = await resp.json();
            if (resp.ok) {
                setFlashSales(data.flashSales);
            } else {
                setError(data.error || "Failed to fetch flash sales");
            }
        } catch (err) {
            setError("Network error fetching sales");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllProducts = async () => {
        try {
            const resp = await fetch("/api/admin/products");
            const data = await resp.json();
            if (resp.ok) {
                setAllProducts(data.products);
            }
        } catch (err) {
            console.error("Failed to fetch products", err);
        }
    };

    useEffect(() => {
        fetchFlashSales();
        fetchAllProducts();
    }, []);

    const handleOpenPanel = (sale: FlashSale | null = null) => {
        if (sale) {
            setEditingSale({
                ...sale,
                expiresAt: new Date(sale.expiresAt).toISOString().slice(0, 16)
            });
        } else {
            setEditingSale({
                title: "The Flash Collection",
                subtitle: "Limited Opportunity",
                expiresAt: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
                isActive: true,
                products: []
            });
        }
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setEditingSale(null);
    };

    const handleAddProduct = (product: Product) => {
        if (!editingSale) return;
        const exists = editingSale.products?.some(p => p.productId === product.id);
        if (exists) return;

        const newProduct: FlashSaleProduct = {
            productId: product.id,
            price: product.price * 0.8, // Default 20% off
            discount: 20,
            product: product
        };

        setEditingSale(prev => ({
            ...prev!,
            products: [...(prev!.products || []), newProduct]
        }));
    };

    const handleRemoveProduct = (productId: string) => {
        setEditingSale(prev => ({
            ...prev!,
            products: prev!.products?.filter(p => p.productId !== productId) || []
        }));
    };

    const handlePriceChange = (productId: string, price: number) => {
        setEditingSale(prev => {
            const product = allProducts.find(p => p.id === productId);
            const originalPrice = product?.price || 1;
            const discount = Number(((originalPrice - price) / originalPrice * 100).toFixed(1));

            return {
                ...prev!,
                products: prev!.products?.map(p => p.productId === productId ? { ...p, price, discount } : p) || []
            };
        });
    };

    const handleDiscountChange = (productId: string, discount: number) => {
        setEditingSale(prev => {
            const product = allProducts.find(p => p.id === productId);
            const originalPrice = product?.price || 0;
            const price = Number((originalPrice * (1 - discount / 100)).toFixed(2));

            return {
                ...prev!,
                products: prev!.products?.map(p => p.productId === productId ? { ...p, price, discount } : p) || []
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSale) return;

        setSubmitting(true);
        const isUpdate = !!editingSale.id;
        const url = isUpdate ? `/api/admin/flash-sales/${editingSale.id}` : "/api/admin/flash-sales";
        const method = isUpdate ? "PUT" : "POST";

        try {
            const resp = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingSale)
            });
            if (resp.ok) {
                fetchFlashSales();
                handleClosePanel();
            } else {
                const data = await resp.json();
                setError(data.error || "Failed to save flash sale");
            }
        } catch (err) {
            setError("Network error saving flash sale");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this flash sale?")) return;
        try {
            const resp = await fetch(`/api/admin/flash-sales/${id}`, { method: "DELETE" });
            if (resp.ok) {
                fetchFlashSales();
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const filteredProducts = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    const getTimeRemaining = (expiry: string) => {
        const total = Date.parse(expiry) - Date.now();
        if (total <= 0) return "Expired";
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <section>
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-4xl font-serif text-[#03045e] italic">Flash Sales & Offers</h2>
                        <p className="text-[11px] text-slate-400 uppercase tracking-[0.2em] mt-2 font-medium">Create and manage time-limited promotional collections</p>
                    </div>
                    <button
                        onClick={() => handleOpenPanel()}
                        className="bg-[#03045e] text-white hover:bg-black px-8 py-3 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#03045e]/10"
                    >
                        <span className="material-symbols-outlined text-sm">bolt</span>
                        New Flash Sale
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-sm flex justify-between items-center transition-all animate-in slide-in-from-top-4">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="material-symbols-outlined text-sm">close</button>
                    </div>
                )}

                <div className="bg-white border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 py-4 px-6 text-left">Event Title</th>
                                    <th className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 py-4 px-6 text-left">Offer Timer</th>
                                    <th className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 py-4 px-6 text-left">Offer Products</th>
                                    <th className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 py-4 px-6 text-left">Status</th>
                                    <th className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="p-10 text-center text-slate-400 uppercase tracking-widest text-xs">Loading Sales...</td></tr>
                                ) : flashSales.length === 0 ? (
                                    <tr><td colSpan={5} className="p-10 text-center text-slate-400 uppercase tracking-widest text-xs">No active flash sales.</td></tr>
                                ) : flashSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-6 px-6 border-b border-slate-50">
                                            <div>
                                                <p className="font-serif italic text-primary text-lg">{sale.title}</p>
                                                <p className="text-[10px] text-slate-400 tracking-wide font-medium">{sale.subtitle}</p>
                                            </div>
                                        </td>
                                        <td className="py-6 px-6 border-b border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-amber-500 text-lg">timer</span>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700">{getTimeRemaining(sale.expiresAt)}</p>
                                                    <p className="text-[9px] text-slate-400 uppercase">Ends: {new Date(sale.expiresAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-6 border-b border-slate-50">
                                            <div className="flex -space-x-2">
                                                {sale.products.slice(0, 3).map((p, i) => (
                                                    <div key={i} className="w-8 h-8 rounded-full bg-white border border-slate-100 overflow-hidden p-1 shadow-sm">
                                                        <img alt="Product" className="w-full h-full object-contain" src={p.product?.imageUrl || ""} />
                                                    </div>
                                                ))}
                                                {sale.products.length > 3 && (
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                        +{sale.products.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400 italic mt-1 font-medium">{sale.products.length} Products included</p>
                                        </td>
                                        <td className="py-6 px-6 border-b border-slate-50">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${sale.isActive ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                                                {sale.isActive ? "Live" : "Paused"}
                                            </span>
                                        </td>
                                        <td className="py-6 px-6 border-b border-slate-50 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenPanel(sale)} className="text-[10px] font-bold tracking-widest uppercase text-primary hover:underline">Edit</button>
                                                <button onClick={() => handleDelete(sale.id)} className="text-[10px] font-bold tracking-widest uppercase text-red-400 hover:text-red-600">Remove</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Editor Panel Overlay */}
            {isPanelOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] transition-opacity" onClick={handleClosePanel} />
            )}

            {/* Editor Panel */}
            <div className={`fixed right-0 top-0 h-full w-full max-w-[500px] bg-white shadow-2xl z-[60] border-l border-slate-100 transition-transform duration-500 transform ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-slate-50/50">
                    <h3 className="text-xl font-serif italic text-[#03045e]">{editingSale?.id ? 'Edit Flash Sale' : 'Create New Collection'}</h3>
                    <button onClick={handleClosePanel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <span className="material-symbols-outlined font-light">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-160px)]">
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Collection Title</label>
                                <input
                                    required
                                    className="w-full bg-slate-50 border-slate-200 focus:ring-1 focus:ring-[#03045e]/20 focus:border-[#03045e] text-xl font-serif italic p-3 outline-none transition-all"
                                    type="text"
                                    value={editingSale?.title || ""}
                                    onChange={e => setEditingSale(prev => ({ ...prev!, title: e.target.value }))}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Subtitle</label>
                                <input
                                    className="w-full bg-slate-50 border-slate-200 focus:ring-1 focus:ring-[#03045e]/20 focus:border-[#03045e] text-xs p-3 outline-none"
                                    type="text"
                                    value={editingSale?.subtitle || ""}
                                    onChange={e => setEditingSale(prev => ({ ...prev!, subtitle: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Expiration Date</label>
                                <input
                                    required
                                    className="w-full bg-slate-50 border-slate-200 focus:ring-1 focus:ring-[#03045e]/20 focus:border-[#03045e] text-xs p-3 outline-none"
                                    type="datetime-local"
                                    value={editingSale?.expiresAt || ""}
                                    onChange={e => setEditingSale(prev => ({ ...prev!, expiresAt: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Initial Status</label>
                                <select
                                    className="w-full bg-slate-50 border-slate-200 p-3 text-xs outline-none"
                                    value={editingSale?.isActive ? "true" : "false"}
                                    onChange={e => setEditingSale(prev => ({ ...prev!, isActive: e.target.value === "true" }))}
                                >
                                    <option value="true">Live</option>
                                    <option value="false">Paused</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-4">Add Products to Sale</label>

                            <div className="relative mb-6">
                                <input
                                    className="w-full bg-white border border-slate-100 p-3 text-xs pl-10 outline-none"
                                    placeholder="Search catalog to add products..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-lg">search</span>

                                {searchQuery && (
                                    <div className="absolute top-full left-0 w-full bg-white shadow-xl border border-slate-100 z-10 mt-1 max-h-60 overflow-y-auto">
                                        {filteredProducts.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => { handleAddProduct(p); setSearchQuery(""); }}
                                                className="p-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50"
                                            >
                                                <div className="w-8 h-8 bg-slate-50 p-1"><img className="w-full h-full object-contain" src={p.imageUrl || ""} /></div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-primary">{p.name}</p>
                                                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">${p.price.toFixed(2)}</p>
                                                </div>
                                                <span className="material-symbols-outlined text-slate-200 text-sm">add_circle</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                {editingSale?.products?.map((p, idx) => (
                                    <div key={idx} className="bg-slate-50/50 border border-slate-100 p-4 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white border border-slate-50 p-1 shrink-0"><img className="w-full h-full object-contain" src={p.product?.imageUrl || ""} /></div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{p.product?.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] text-slate-400 line-through">${p.product?.price.toFixed(2)}</span>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={p.price}
                                                        onChange={e => handlePriceChange(p.productId, parseFloat(e.target.value) || 0)}
                                                        className="w-20 bg-white border border-slate-200 px-2 py-1 text-[11px] font-bold text-amber-600 outline-none"
                                                    />
                                                    <span className="absolute -top-2 left-0 text-[7px] text-amber-600 font-bold uppercase transition-all">Sale Price</span>
                                                </div>
                                                <div className="relative ml-2">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={p.discount || 0}
                                                        onChange={e => handleDiscountChange(p.productId, parseFloat(e.target.value) || 0)}
                                                        className="w-16 bg-white border border-slate-200 px-2 py-1 text-[11px] font-bold text-green-600 outline-none"
                                                    />
                                                    <span className="absolute -top-2 left-0 text-[7px] text-green-600 font-bold uppercase transition-all">% OFF</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveProduct(p.productId)} className="p-2 hover:bg-red-50 text-red-300 hover:text-red-500 rounded-full transition-all">
                                            <span className="material-symbols-outlined text-sm font-light">remove_circle</span>
                                        </button>
                                    </div>
                                ))}
                                {editingSale?.products?.length === 0 && (
                                    <div className="py-10 border-2 border-dashed border-slate-50 text-center flex flex-col items-center">
                                        <span className="material-symbols-outlined text-slate-200 text-3xl mb-2">shopping_basket</span>
                                        <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">Add products to start the sale</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-8 bg-white border-t border-slate-100 flex gap-4">
                        <button
                            type="button"
                            onClick={handleClosePanel}
                            className="flex-1 px-4 py-4 text-[10px] font-bold tracking-widest uppercase border border-slate-100 text-slate-400 hover:bg-slate-50 transition-all duration-300"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !editingSale?.products?.length}
                            className="flex-1 px-4 py-4 text-[10px] font-bold tracking-widest uppercase bg-[#03045e] text-white hover:bg-black transition-all duration-300 disabled:opacity-50"
                        >
                            {submitting ? "Publishing..." : (editingSale?.id ? "Update Event" : "Launch Sale")}
                        </button>
                    </div>
                </form>
            </div>

            <footer className="pt-20 pb-10 text-center">
                <p className="text-[9px] uppercase tracking-[0.5em] text-slate-300">ORGANICROOTS Promotional Engine v1.0.0 | © 2024</p>
            </footer>
        </div>
    );
}
