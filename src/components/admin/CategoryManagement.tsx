"use client";

import { useEffect, useState } from "react";

type Category = {
    id: string;
    name: string;
    imageUrl: string | null;
    accentColor: string;
    priority: number;
    isVisible: boolean;
};

const ACCENT_COLORS = [
    "#caf0f8", // Light Cyan
    "#ade8f4", // Frosted Blue
    "#fee2e2", // Rose 50 (light rose)
    "#fef3c7", // Amber 50 (light orange)
    "#f0fdf4", // Green 50 (light green)
];

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchCategories = async () => {
        try {
            const resp = await fetch("/api/admin/categories");
            const data = await resp.json();
            if (resp.ok) {
                setCategories(data.categories);
            } else {
                setError(data.error || "Failed to fetch categories");
            }
        } catch (err) {
            setError("Network error fetching categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenPanel = (category: Partial<Category> | null = null) => {
        setEditingCategory(category || { name: "", accentColor: "#caf0f8", priority: 0, isVisible: true });
        setPreviewImage(category?.imageUrl || null);
        setSelectedFile(null);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setEditingCategory(null);
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
        if (!editingCategory) return;

        setSubmitting(true);
        const formData = new FormData();
        formData.append("name", editingCategory.name || "");
        formData.append("accentColor", editingCategory.accentColor || "#caf0f8");
        formData.append("priority", String(editingCategory.priority || 0));
        formData.append("isVisible", String(editingCategory.isVisible));
        if (selectedFile) {
            formData.append("file", selectedFile);
        }

        const isUpdate = !!editingCategory.id;
        const url = isUpdate ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories";
        const method = isUpdate ? "PUT" : "POST";

        try {
            const resp = await fetch(url, { method, body: formData });
            const data = await resp.json();

            if (resp.ok) {
                fetchCategories();
                handleClosePanel();
            } else {
                setError(data.error || "Failed to save category");
            }
        } catch (err) {
            setError("Network error saving category");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            const resp = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
            if (resp.ok) {
                fetchCategories();
            } else {
                const data = await resp.json();
                setError(data.error || "Failed to delete category");
            }
        } catch (err) {
            setError("Network error deleting category");
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400 uppercase tracking-widest text-xs">Loading Categories...</div>;

    return (
        <div className="space-y-12">
            <section>
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-serif italic text-primary">Category Management</h2>
                        <p className="text-xs text-slate-400 uppercase tracking-[0.2em] mt-2">Curate the circular navigation and product groupings</p>
                    </div>
                    <button
                        onClick={() => handleOpenPanel()}
                        className="bg-primary text-white hover:bg-primary-dark px-8 py-3 text-[10px] font-bold tracking-widest-extra uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                    >
                        <span className="material-symbols-outlined text-base">add_circle</span>
                        Add New Category
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-sm flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="material-symbols-outlined text-sm">close</button>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-12">
                    {categories.map((cat) => (
                        <div key={cat.id} className="group text-center">
                            <div
                                className="relative w-40 h-40 mx-auto rounded-full flex items-center justify-center transition-all duration-500 overflow-hidden border border-transparent hover:border-primary/20 hover:shadow-xl hover:scale-105"
                                style={{ backgroundColor: cat.accentColor || "#caf0f8" }}
                            >
                                {cat.imageUrl ? (
                                    <img alt={cat.name} className="w-2/3 h-2/3 object-contain" src={cat.imageUrl} />
                                ) : (
                                    <span className="material-symbols-outlined text-4xl text-primary/20">category</span>
                                )}
                                <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => handleOpenPanel(cat)}
                                        className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-frosted-blue transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center hover:bg-red-50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-serif italic text-primary mt-6 mb-1">{cat.name}</h3>
                            <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 font-bold">
                                {cat.isVisible ? "Visible" : "Hidden"} • Priority {cat.priority}
                            </p>
                        </div>
                    ))}

                    <button
                        onClick={() => handleOpenPanel()}
                        className="group flex flex-col items-center"
                    >
                        <div className="w-40 h-40 mx-auto rounded-full flex flex-col items-center justify-center border-dashed border-2 border-slate-200 bg-white hover:border-primary hover:bg-slate-50 transition-all duration-500">
                            <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary transition-colors">add_circle</span>
                        </div>
                        <h3 className="text-lg font-serif italic text-slate-400 mt-6">Add Category</h3>
                    </button>
                </div>
            </section>

            {/* Side Panel Overlay */}
            {isPanelOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] transition-opacity"
                    onClick={handleClosePanel}
                />
            )}

            {/* Side Panel */}
            <div className={`fixed right-0 top-0 h-full w-full max-w-[450px] bg-white shadow-2xl z-[60] border-l border-slate-100 transition-transform duration-500 transform ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-slate-50/50">
                    <h3 className="text-xl font-serif italic text-primary">{editingCategory?.id ? "Edit Category" : "Add New Category"}</h3>
                    <button
                        onClick={handleClosePanel}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        <span className="material-symbols-outlined font-light">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-160px)]">
                    <div>
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-4">Category Image (Watercolor Style)</label>
                        <div className="relative group">
                            <div
                                className="w-full h-56 rounded-none flex items-center justify-center border border-dashed border-slate-200 group-hover:border-primary/40 transition-all overflow-hidden"
                                style={{ backgroundColor: editingCategory?.accentColor || "#caf0f8" }}
                            >
                                {previewImage ? (
                                    <img alt="Preview" className="w-1/2 h-1/2 object-contain" src={previewImage} />
                                ) : (
                                    <span className="material-symbols-outlined text-5xl text-primary/10">add_photo_alternate</span>
                                )}

                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <label className="bg-white px-4 py-2 text-[9px] font-bold uppercase tracking-widest shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                                        {previewImage ? "Replace Image" : "Upload Image"}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-2 italic text-center uppercase tracking-widest">Recommended: Transparent PNG, Watercolor style, 800x800px</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Category Name</label>
                            <input
                                required
                                className="w-full bg-slate-50 border-slate-200 focus:ring-1 focus:ring-primary/20 focus:border-primary text-xl font-serif italic p-3 outline-none transition-all"
                                type="text"
                                value={editingCategory?.name || ""}
                                onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Heritage Meats"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Background Accent Color</label>
                            <div className="grid grid-cols-5 gap-3">
                                {ACCENT_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setEditingCategory(prev => ({ ...prev, accentColor: color }))}
                                        className={`w-full aspect-square border-2 transition-all ${editingCategory?.accentColor === color ? "border-primary scale-110 shadow-sm" : "border-transparent hover:scale-105"}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <input
                                    type="color"
                                    className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer"
                                    value={editingCategory?.accentColor || "#caf0f8"}
                                    onChange={(e) => setEditingCategory(prev => ({ ...prev, accentColor: e.target.value }))}
                                />
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Custom Hex: {editingCategory?.accentColor}</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 block mb-2">Display Order Priority</label>
                            <input
                                className="w-full bg-slate-50 border-slate-200 focus:ring-1 focus:ring-primary/20 focus:border-primary text-sm p-3 outline-none"
                                type="number"
                                value={editingCategory?.priority || 0}
                                onChange={(e) => setEditingCategory(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                            />
                        </div>

                        <div className="pt-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Visible on Landing Page</p>
                                    <p className="text-[9px] text-slate-400 mt-1">Show in the circular navigation cluster</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={editingCategory?.isVisible || false}
                                        onChange={(e) => setEditingCategory(prev => ({ ...prev, isVisible: e.target.checked }))}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-8 bg-white border-t border-slate-100 flex gap-4">
                        <button
                            type="button"
                            onClick={handleClosePanel}
                            className="flex-1 px-4 py-4 text-[10px] font-bold tracking-widest uppercase border border-primary/20 text-primary hover:bg-primary/5 transition-all duration-300"
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-4 text-[10px] font-bold tracking-widest uppercase bg-primary text-white hover:bg-primary-dark transition-all duration-300 disabled:opacity-50"
                        >
                            {submitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
