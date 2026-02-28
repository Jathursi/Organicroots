"use client";

import { useEffect, useState } from "react";

type Product = {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    category: { name: string };
};

type Collection = {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    isActive: boolean;
    products?: { productId: string }[];
    _count?: { products: number };
};

export default function CollectionManagement() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI State
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Partial<Collection> | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    const fetchCollections = async () => {
        try {
            const resp = await fetch("/api/admin/collections");
            const data = await resp.json();
            if (resp.ok) {
                setCollections(data.collections);
            } else {
                setError(data.error || "Failed to fetch collections");
            }
        } catch (err) {
            setError("Network error fetching collections");
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
        fetchCollections();
        fetchAllProducts();
    }, []);

    const handleOpenPanel = (collection: Collection | null = null) => {
        if (collection) {
            setEditingCollection(collection);
            setPreviewImage(collection.imageUrl);
            setSelectedProductIds(collection.products?.map(p => p.productId) || []);
        } else {
            setEditingCollection({ title: "", description: "", isActive: true });
            setPreviewImage(null);
            setSelectedProductIds([]);
        }
        setSelectedFile(null);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setEditingCollection(null);
        setPreviewImage(null);
        setSelectedFile(null);
        setSelectedProductIds([]);
        setSearchQuery("");
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
        if (!editingCollection) return;

        setSubmitting(true);
        const isUpdate = !!editingCollection.id;
        const url = isUpdate ? `/api/admin/collections/${editingCollection.id}` : "/api/admin/collections";
        const method = isUpdate ? "PUT" : "POST";

        try {
            const formData = new FormData();
            formData.append("title", editingCollection.title || "");
            formData.append("slug", editingCollection.slug || "");
            formData.append("description", editingCollection.description || "");
            formData.append("isActive", String(editingCollection.isActive));
            formData.append("productIds", JSON.stringify(selectedProductIds));
            if (selectedFile) formData.append("file", selectedFile);

            const resp = await fetch(url, {
                method,
                body: formData
            });

            if (resp.ok) {
                fetchCollections();
                handleClosePanel();
            } else {
                const data = await resp.json();
                setError(data.error || "Failed to save collection");
            }
        } catch (err) {
            setError("Network error saving collection");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this collection?")) return;
        try {
            const resp = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
            if (resp.ok) {
                fetchCollections();
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const toggleProductSelection = (id: string) => {
        setSelectedProductIds(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const filteredProducts = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <section>
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-4xl font-serif text-[#03045e] italic">Curated Collections</h2>
                        <p className="text-[11px] text-slate-400 uppercase tracking-[0.2em] mt-2 font-medium">Group products into thematic tiles for high-engagement merchandising</p>
                    </div>
                    <button
                        onClick={() => handleOpenPanel()}
                        className="bg-[#03045e] text-white hover:bg-black px-8 py-3 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#03045e]/10"
                    >
                        <span className="material-symbols-outlined text-sm">grid_view</span>
                        New Collection
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-sm flex justify-between items-center animate-in slide-in-from-top-4">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="material-symbols-outlined text-sm">close</button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => <div key={i} className="h-48 bg-slate-50 animate-pulse rounded-none border border-slate-100" />)
                    ) : collections.length === 0 ? (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 flex flex-col items-center">
                            <span className="material-symbols-outlined text-slate-200 text-5xl mb-4">collections</span>
                            <p className="text-slate-300 uppercase tracking-widest text-[10px] font-bold">No collections created yet.</p>
                        </div>
                    ) : collections.map((col) => (
                        <div key={col.id} className="bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 group relative overflow-hidden">
                            <div className="h-48 bg-slate-50 overflow-hidden relative">
                                {col.imageUrl ? (
                                    <img src={col.imageUrl} alt={col.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                        <span className="material-symbols-outlined text-4xl font-light">image</span>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className={`text-[8px] font-bold uppercase tracking-[0.3em] px-2 py-0.5 rounded-full shadow-sm ${col.isActive ? "bg-white text-green-600" : "bg-white text-slate-400"
                                        }`}>
                                        {col.isActive ? "Live" : "Paused"}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="font-serif italic text-2xl text-primary mb-1">{col.title}</h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">{col._count?.products || 0} Dynamic Offerings</p>

                                <p className="text-[10px] text-slate-600 leading-relaxed mb-6 line-clamp-2">
                                    {col.description || "Freshly curated heritage products for your refined lifestyle."}
                                </p>

                                <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                                    <button onClick={() => handleOpenPanel(col)} className="text-[10px] font-bold tracking-widest uppercase text-primary hover:underline">Customize</button>
                                    <button onClick={() => handleDelete(col.id)} className="text-[10px] font-bold tracking-widest uppercase text-red-300 hover:text-red-500">Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Editor Panel Overlay */}
            {isPanelOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] transition-opacity" onClick={handleClosePanel} />
            )}

            {/* Editor Panel */}
            <div className={`fixed right-0 top-0 h-full w-full max-w-[600px] bg-white shadow-2xl z-[60] border-l border-slate-100 transition-transform duration-500 transform ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-slate-50/50">
                    <h3 className="text-xl font-serif italic text-primary">{editingCollection?.id ? 'Adjust Collection' : 'Compose Collection'}</h3>
                    <button onClick={handleClosePanel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <span className="material-symbols-outlined font-light">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto h-[calc(100vh-160px)]">
                    <div className="grid grid-cols-1 gap-8">
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-3">Collection Visual</label>
                            <div className="relative group">
                                <div className="w-full h-56 bg-slate-50 flex items-center justify-center border border-dashed border-slate-200 group-hover:border-primary/40 transition-all overflow-hidden relative">
                                    {previewImage ? (
                                        <img alt="Preview" className="w-full h-full object-cover" src={previewImage} />
                                    ) : (
                                        <div className="text-center">
                                            <span className="material-symbols-outlined text-4xl text-primary/10">add_photo_alternate</span>
                                            <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-2">Upload Hero Image</p>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label className="bg-white px-4 py-2 text-[9px] font-bold uppercase tracking-widest shadow-sm cursor-pointer hover:bg-slate-50">
                                            {previewImage ? "Change Image" : "Select Image"}
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-3">Collection Title</label>
                            <input
                                required
                                className="w-full bg-slate-50 border-slate-200 focus:ring-1 focus:ring-primary/20 focus:border-primary text-2xl font-serif italic p-4 outline-none transition-all"
                                type="text"
                                placeholder="e.g. Garden Grains"
                                value={editingCollection?.title || ""}
                                onChange={e => setEditingCollection(prev => ({ ...prev!, title: e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-3">Strategic Description</label>
                            <textarea
                                className="w-full bg-slate-50 border-slate-200 focus:ring-1 focus:ring-primary/20 focus:border-primary text-xs p-4 outline-none h-24 resize-none transition-all"
                                placeholder="Highlight the artisanal value of this collection..."
                                value={editingCollection?.description || ""}
                                onChange={e => setEditingCollection(prev => ({ ...prev!, description: e.target.value }))}
                            />
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-8 space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Assign Offerings</label>
                                <div className="text-[9px] font-bold uppercase text-slate-400">{selectedProductIds.length} Selected</div>
                            </div>

                            <div className="relative mb-6">
                                <input
                                    className="w-full bg-white border border-slate-200 p-3 text-xs outline-none pl-10"
                                    placeholder="Search products by name or category..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-lg font-light">search</span>
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {filteredProducts.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => toggleProductSelection(p.id)}
                                        className={`p-3 border flex items-center justify-between cursor-pointer transition-all ${selectedProductIds.includes(p.id) ? "bg-white border-primary border-l-4" : "bg-white/50 border-slate-100 opacity-60 hover:opacity-100"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-50 flex items-center justify-center p-1">
                                                {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-contain" /> : <span className="material-symbols-outlined text-slate-200">inventory_2</span>}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{p.name}</p>
                                                <p className="text-[8px] text-slate-400 uppercase">{p.category.name}</p>
                                            </div>
                                        </div>
                                        {selectedProductIds.includes(p.id) && <span className="material-symbols-outlined text-primary text-sm">check_circle</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pb-20">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-3">Live Visibility</label>
                            <select
                                className="w-full bg-slate-50 border-slate-200 p-4 text-[10px] font-bold uppercase tracking-widest outline-none"
                                value={editingCollection?.isActive ? "true" : "false"}
                                onChange={e => setEditingCollection(prev => ({ ...prev!, isActive: e.target.value === "true" }))}
                            >
                                <option value="true">Enable Collection (Live on Storefront)</option>
                                <option value="false">Disable Collection (Internal Refinement)</option>
                            </select>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-8 bg-white border-t border-slate-100 flex gap-4">
                        <button
                            type="button"
                            onClick={handleClosePanel}
                            className="flex-1 px-4 py-5 text-[10px] font-bold tracking-widest uppercase border border-slate-100 text-slate-400 hover:bg-slate-50 transition-all duration-300"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-5 text-[10px] font-bold tracking-widest uppercase bg-primary text-white hover:bg-black transition-all duration-300 disabled:opacity-50"
                        >
                            {submitting ? "Processing..." : (editingCollection?.id ? "Sync Changes" : "Create Collection")}
                        </button>
                    </div>
                </form>
            </div>

            <footer className="pt-20 pb-10 text-center">
                <p className="text-[9px] uppercase tracking-[0.5em] text-slate-300">ORGANICROOTS Merchandising Core v3.0 | Curated Lifestyle Engineering</p>
            </footer>
        </div>
    );
}
