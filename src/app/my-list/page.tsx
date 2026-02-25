"use client";

import { useEffect, useState } from "react";

type ListItem = {
  id: string;
  name: string;
  price: string | null;
  image: string | null;
  category: string | null;
};

export default function MyListPage() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch("/api/list", { cache: "no-store" });
        const data = (await response.json()) as { items?: ListItem[] };

        if (!response.ok) {
          return;
        }

        setItems(data.items ?? []);
      } finally {
        setLoading(false);
      }
    };

    void loadItems();
  }, []);

  return (
    <main className="min-h-screen bg-background-light text-primary p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary/50 mb-3">My List</p>
        <h1 className="text-3xl md:text-4xl mb-8">Saved Products</h1>

        {loading ? (
          <p className="text-primary/70">Loading products...</p>
        ) : items.length === 0 ? (
          <div className="bg-white border border-primary/10 p-8">
            <p className="text-primary/70">Your list is empty. Add products from the homepage.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <article className="bg-white border border-primary/10 p-5" key={item.id}>
                {item.image ? (
                  <img alt={item.name} className="w-full h-44 object-contain bg-slate-50 mb-4" src={item.image} />
                ) : (
                  <div className="w-full h-44 bg-slate-50 mb-4" />
                )}
                {item.category && (
                  <p className="text-[10px] tracking-[0.2em] uppercase text-primary/50 mb-2">{item.category}</p>
                )}
                <h2 className="text-xl font-serif mb-2">{item.name}</h2>
                <p className="text-primary/80">{item.price ?? "Price unavailable"}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
