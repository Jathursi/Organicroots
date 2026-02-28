"use client";

import { useEffect, useState } from "react";

type Product = {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    category: { name: string };
};

type Offer = {
    id: string;
    title: string;
    type: "BOGO" | "BXGY" | "DISCOUNT" | "THRESHOLD";
    isActive: boolean;
    triggerProductId?: string | null;
    triggerQuantity?: number | null;
    rewardProductId?: string | null;
    rewardQuantity?: number | null;
    discountValue?: number | null;
    discountType?: "PERCENTAGE" | "FIXED" | null;
    thresholdWeight?: number | null;
    thresholdValue?: number | null;
    savingsAmount?: number | null;
    expiresAt?: string | null;
};

export default function OfferManagement() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI State
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchTarget, setSearchTarget] = useState<"trigger" | "reward" | null>(null);

    const fetchOffers = async () => {
        try {
            const resp = await fetch("/api/admin/offers");
            const data = await resp.json();
            if (resp.ok) {
                setOffers(data.offers);
            } else {
                setError(data.error || "Failed to fetch offers");
            }
        } catch (err) {
            setError("Network error fetching offers");
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
        fetchOffers();
        fetchAllProducts();
    }, []);

    const handleOpenPanel = (offer: Offer | null = null) => {
        if (offer) {
            setEditingOffer({
                ...offer,
                expiresAt: offer.expiresAt ? new Date(offer.expiresAt).toISOString().slice(0, 16) : null
            });
        } else {
            setEditingOffer({
                title: "",
                type: "BOGO",
                isActive: true,
                triggerQuantity: 1,
                rewardQuantity: 1,
                discountType: "PERCENTAGE",
                discountValue: 10
            });
        }
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setEditingOffer(null);
        setSearchQuery("");
        setSearchTarget(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOffer) return;

        setSubmitting(true);
        const isUpdate = !!editingOffer.id;
        const url = isUpdate ? `/api/admin/offers/${editingOffer.id}` : "/api/admin/offers";
        const method = isUpdate ? "PUT" : "POST";

        try {
            const resp = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingOffer)
            });
            if (resp.ok) {
                fetchOffers();
                handleClosePanel();
            } else {
                const data = await resp.json();
                setError(data.error || "Failed to save offer");
            }
        } catch (err) {
            setError("Network error saving offer");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this offer?")) return;
        try {
            const resp = await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
            if (resp.ok) {
                fetchOffers();
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const filteredProducts = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    const getOfferLabel = (offer: Offer) => {
        switch (offer.type) {
            case "BOGO": return "Buy 1 Get 1 Free";
            case "BXGY": return "Purchase Combination";
            case "DISCOUNT": return "Standard Reduction";
            case "THRESHOLD": return "Performance Bonus";
            default: return offer.type;
        }
    };

    const getOfferSummary = (offer: Offer) => {
        const trigger = allProducts.find(p => p.id === offer.triggerProductId)?.name || "product";
        const reward = allProducts.find(p => p.id === offer.rewardProductId)?.name || "another product";

        switch (offer.type) {
            case "BOGO": return `Buy ${offer.triggerQuantity} of ${trigger}, get ${offer.rewardQuantity} Free`;
            case "BXGY": return `Buy ${offer.triggerQuantity} of ${trigger}, get ${offer.rewardQuantity} of ${reward}`;
            case "DISCOUNT": return `${offer.discountValue}${offer.discountType === "PERCENTAGE" ? "%" : "$"} off all orders`;
            case "THRESHOLD":
                if (offer.thresholdWeight) return `Save $${offer.savingsAmount} on orders above ${offer.thresholdWeight}g`;
                return `Save $${offer.savingsAmount} on orders over $${offer.thresholdValue}`;
            default: return "";
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <section>
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-4xl font-serif text-[#03045e] italic">Promotional Offers</h2>
                        <p className="text-[11px] text-slate-400 uppercase tracking-[0.2em] mt-2 font-medium">Configure complex BOGO, discounts, and threshold-based savings</p>
                    </div>
                    <button
                        onClick={() => handleOpenPanel()}
                        className="bg-[#03045e] text-white hover:bg-black px-8 py-3 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#03045e]/10"
                    >
                        <span className="material-symbols-outlined text-sm">redeem</span>
                        New Offer
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
                    ) : offers.length === 0 ? (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 flex flex-col items-center">
                            <span className="material-symbols-outlined text-slate-200 text-5xl mb-4">settings_suggest</span>
                            <p className="text-slate-300 uppercase tracking-widest text-[10px] font-bold">No sophisticated offers configured yet.</p>
                        </div>
                    ) : offers.map((offer) => (
                        <div key={offer.id} className="bg-white border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 group relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rotate-45 ${offer.type === "BOGO" ? "bg-amber-100/30" :
                                    offer.type === "BXGY" ? "bg-blue-100/30" :
                                        offer.type === "DISCOUNT" ? "bg-green-100/30" : "bg-purple-100/30"
                                }`} />

                            <div className="relative">
                                <span className={`text-[8px] font-bold uppercase tracking-[0.3em] px-2 py-0.5 rounded-full mb-4 inline-block ${offer.isActive ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"
                                    }`}>
                                    {offer.isActive ? "Active" : "Paused"}
                                </span>

                                <h3 className="font-serif italic text-2xl text-primary mb-2">{offer.title}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">{getOfferLabel(offer)}</p>

                                <p className="text-xs text-slate-600 leading-relaxed mb-8 italic min-h-[40px]">
                                    "{getOfferSummary(offer)}"
                                </p>

                                <div className="flex justify-between items-center pt-4">
                                    <div className="flex gap-4">
                                        <button onClick={() => handleOpenPanel(offer)} className="text-[10px] font-bold tracking-widest uppercase text-primary hover:underline">Configure</button>
                                        <button onClick={() => handleDelete(offer.id)} className="text-[10px] font-bold tracking-widest uppercase text-red-300 hover:text-red-500">Remove</button>
                                    </div>
                                    {offer.expiresAt && (
                                        <span className="text-[9px] text-slate-300 uppercase tracking-[0.1em] font-medium">Expires: {new Date(offer.expiresAt).toLocaleDateString()}</span>
                                    )}
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
            <div className={`fixed right-0 top-0 h-full w-full max-w-[550px] bg-white shadow-2xl z-[60] border-l border-slate-100 transition-transform duration-500 transform ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-slate-50/50">
                    <h3 className="text-xl font-serif italic text-primary">{editingOffer?.id ? 'Adjust Campaign' : 'New Dynamic Offer'}</h3>
                    <button onClick={handleClosePanel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <span className="material-symbols-outlined font-light">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-10 overflow-y-auto h-[calc(100vh-160px)]">
                    <div className="space-y-8">
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-3">Offer Classification</label>
                            <div className="grid grid-cols-4 gap-2">
                                {(["BOGO", "BXGY", "DISCOUNT", "THRESHOLD"] as const).map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setEditingOffer(prev => ({ ...prev!, type }))}
                                        className={`py-3 text-[9px] font-bold uppercase tracking-widest border transition-all ${editingOffer?.type === type ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-3">Campaign Headline</label>
                            <input
                                required
                                className="w-full bg-slate-50 border-slate-200 focus:ring-1 focus:ring-primary/20 focus:border-primary text-2xl font-serif italic p-4 outline-none transition-all"
                                type="text"
                                placeholder="e.g. Summer Sensations"
                                value={editingOffer?.title || ""}
                                onChange={e => setEditingOffer(prev => ({ ...prev!, title: e.target.value }))}
                            />
                        </div>

                        {/* Conditional Logic UI */}
                        <div className="bg-slate-50/50 border border-slate-100 p-8 space-y-8 rounded-none">
                            {(editingOffer?.type === "BOGO" || editingOffer?.type === "BXGY") && (
                                <>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary block mb-3">Primary Action</label>
                                            <div className="relative">
                                                <input
                                                    className="w-full bg-white border border-slate-200 p-3 text-xs outline-none pl-10"
                                                    placeholder="Trigger Product..."
                                                    value={allProducts.find(p => p.id === editingOffer.triggerProductId)?.name || searchQuery}
                                                    onChange={e => { setSearchQuery(e.target.value); setSearchTarget("trigger"); }}
                                                    onFocus={() => setSearchTarget("trigger")}
                                                />
                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">shopping_cart</span>

                                                {searchTarget === "trigger" && searchQuery && (
                                                    <div className="absolute top-full left-0 w-full bg-white shadow-2xl border border-slate-100 z-10 mt-1 max-h-48 overflow-y-auto">
                                                        {filteredProducts.map(p => (
                                                            <div key={p.id} onClick={() => { setEditingOffer(prev => ({ ...prev!, triggerProductId: p.id })); setSearchQuery(""); setSearchTarget(null); }} className="p-3 hover:bg-slate-50 cursor-pointer text-[10px] font-bold text-slate-700 uppercase border-b border-slate-50">{p.name}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary block mb-3">Purchase Qty</label>
                                            <input
                                                className="w-full bg-white border border-slate-200 p-3 text-xs outline-none font-bold"
                                                type="number"
                                                value={editingOffer?.triggerQuantity ?? 1}
                                                onChange={e => setEditingOffer(prev => ({ ...prev!, triggerQuantity: parseInt(e.target.value) }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-600 block mb-3">Reward Gift</label>
                                            <div className="relative">
                                                <input
                                                    disabled={editingOffer.type === "BOGO"}
                                                    className="w-full bg-white border border-slate-200 p-3 text-xs outline-none pl-10 disabled:bg-slate-50 disabled:text-slate-300"
                                                    placeholder={editingOffer.type === "BOGO" ? "Same as Purchase" : "Reward Product..."}
                                                    value={editingOffer.type === "BOGO" ? "" : (allProducts.find(p => p.id === editingOffer.rewardProductId)?.name || searchQuery)}
                                                    onChange={e => { setSearchQuery(e.target.value); setSearchTarget("reward"); }}
                                                    onFocus={() => setSearchTarget("reward")}
                                                />
                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 text-lg">card_giftcard</span>

                                                {searchTarget === "reward" && searchQuery && editingOffer.type === "BXGY" && (
                                                    <div className="absolute top-full left-0 w-full bg-white shadow-2xl border border-slate-100 z-10 mt-1 max-h-48 overflow-y-auto">
                                                        {filteredProducts.map(p => (
                                                            <div key={p.id} onClick={() => { setEditingOffer(prev => ({ ...prev!, rewardProductId: p.id })); setSearchQuery(""); setSearchTarget(null); }} className="p-3 hover:bg-slate-50 cursor-pointer text-[10px] font-bold text-slate-700 uppercase border-b border-slate-50">{p.name}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-600 block mb-3">Free Qty</label>
                                            <input
                                                className="w-full bg-white border border-slate-200 p-3 text-xs outline-none font-bold text-amber-600"
                                                type="number"
                                                value={editingOffer?.rewardQuantity ?? 1}
                                                onChange={e => setEditingOffer(prev => ({ ...prev!, rewardQuantity: parseInt(e.target.value) }))}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {editingOffer?.type === "DISCOUNT" && (
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary block mb-3">Unit</label>
                                        <select
                                            className="w-full bg-white border border-slate-200 p-3 text-xs outline-none"
                                            value={editingOffer.discountType || "PERCENTAGE"}
                                            onChange={e => setEditingOffer(prev => ({ ...prev!, discountType: e.target.value as any }))}
                                        >
                                            <option value="PERCENTAGE">Percentage (%)</option>
                                            <option value="FIXED">Flat Savings ($)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary block mb-3">Magnitude</label>
                                        <input
                                            className="w-full bg-white border border-slate-200 p-3 text-xs outline-none font-bold"
                                            type="number"
                                            value={editingOffer?.discountValue ?? 0}
                                            onChange={e => setEditingOffer(prev => ({ ...prev!, discountValue: parseFloat(e.target.value) }))}
                                        />
                                    </div>
                                </div>
                            )}

                            {editingOffer?.type === "THRESHOLD" && (
                                <>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary block mb-3">Condition</label>
                                            <div className="flex bg-white border border-slate-200 p-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingOffer(prev => ({ ...prev!, thresholdWeight: 1000, thresholdValue: null }))}
                                                    className={`flex-1 py-2 text-[8px] font-bold uppercase transition-all ${editingOffer.thresholdWeight ? "bg-primary text-white" : "text-slate-400 hover:text-primary"}`}
                                                >Weight</button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingOffer(prev => ({ ...prev!, thresholdValue: 100, thresholdWeight: null }))}
                                                    className={`flex-1 py-2 text-[8px] font-bold uppercase transition-all ${editingOffer.thresholdValue ? "bg-primary text-white" : "text-slate-400 hover:text-primary"}`}
                                                >Value ($)</button>
                                            </div>
                                        </div>
                                        <div>
                                            {editingOffer.thresholdWeight ? (
                                                <>
                                                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary block mb-3">Minimum Grams</label>
                                                    <input
                                                        className="w-full bg-white border border-slate-200 p-3 text-xs outline-none font-bold"
                                                        type="number"
                                                        value={editingOffer.thresholdWeight || 1000}
                                                        onChange={e => setEditingOffer(prev => ({ ...prev!, thresholdWeight: parseFloat(e.target.value) }))}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary block mb-3">Minimum Order Value</label>
                                                    <input
                                                        className="w-full bg-white border border-slate-200 p-3 text-xs outline-none font-bold"
                                                        type="number"
                                                        value={editingOffer.thresholdValue || 100}
                                                        onChange={e => setEditingOffer(prev => ({ ...prev!, thresholdValue: parseFloat(e.target.value) }))}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-green-600 block mb-3">Automatic Savings ($)</label>
                                        <input
                                            className="w-full bg-white border border-slate-200 p-3 text-xs outline-none font-bold text-green-600"
                                            type="number"
                                            value={editingOffer?.savingsAmount ?? 5}
                                            onChange={e => setEditingOffer(prev => ({ ...prev!, savingsAmount: parseFloat(e.target.value) }))}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-10 border-t border-slate-100 pt-10">
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-3">Launch Status</label>
                                <select
                                    className="w-full bg-slate-50 border-slate-200 p-4 text-[10px] font-bold uppercase tracking-widest outline-none"
                                    value={editingOffer?.isActive ? "true" : "false"}
                                    onChange={e => setEditingOffer(prev => ({ ...prev!, isActive: e.target.value === "true" }))}
                                >
                                    <option value="true">Live (Active)</option>
                                    <option value="false">Static (Paused)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-3">Termination Date</label>
                                <input
                                    className="w-full bg-slate-50 border-slate-200 p-4 text-xs outline-none"
                                    type="datetime-local"
                                    value={editingOffer?.expiresAt || ""}
                                    onChange={e => setEditingOffer(prev => ({ ...prev!, expiresAt: e.target.value }))}
                                />
                            </div>
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
                            {submitting ? "Processing..." : (editingOffer?.id ? "Update Campaign" : "Launch Offer")}
                        </button>
                    </div>
                </form>
            </div>

            <footer className="pt-20 pb-10 text-center">
                <p className="text-[9px] uppercase tracking-[0.5em] text-slate-300">ORGANICROOTS Campaign Engine v2.1.0 | Higher Yield Promotions</p>
            </footer>
        </div>
    );
}
