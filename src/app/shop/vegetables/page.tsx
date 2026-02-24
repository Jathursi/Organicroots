"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const products = [
  {
    id: 1,
    name: "Organic Curly Kale",
    category: "Heritage Estate",
    weight: "250g",
    price: "$4.50",
    rating: 5,
    reviews: 42,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAE3rpi3g2G1uHA4-rP_ptkD0M1oyEcOgAI7KfWL14U_xwnSBC6uxWYNrdxlN5hR0Ef7By1MJhk5OyeBfJQdYIVNFMeWByBL_enkrsRw1LTTjEWpIQYNdcxxfr2RulCRV18k0CxoaM_pLCwZW-f7M3v7_33mff7Y99Ac6Y9yL6KhU1oC4CCK_SGMFjkZapLIrubOOi1F3W1f4wb7kxEn20HB76BCFJZ1RewYKypsb6AYf00J6OXQMzfI1LGHpJvarVqN8nQ9zR9SxVP",
    badge: "Freshly Harvested",
    badgeColor: "bg-frosted-blue",
  },
  {
    id: 2,
    name: "Heirloom Rainbow Carrots",
    category: "Coastal Farm",
    weight: "500g",
    price: "$6.75",
    rating: 4,
    reviews: 28,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDC7hjJ81FJnujXzosLBwnZL4nAxoY0lc-NmPKY_DafjyUWuoPRQFc4YFwx--1-uo-irrvvjeCZZk7-GSZ9TTakl9Qi_4Zzg2G7i56o0b41-JUx_MmUuT7uPV4JAiHlOL6rWoUtLJv1f0sOBcLiDCy5AZL01z9wO0cLM0-MEkB9a1w23jF-JHX6mhEqDuI_u8agAm25ESXq5WZDW_mZT9F9vi-QIjNg9Kg2THCri90nWgEMv6maKsqGAHSPOvtCJQSh6SfPoNj-ICvw",
  },
  {
    id: 3,
    name: "Organic Vine Tomatoes",
    category: "Tuscany Harvest",
    weight: "500g",
    price: "$8.00",
    rating: 5,
    reviews: 56,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBd2jvcKDP11VunjnsPGw7DEQBG3H5D7Xd95JBfnHX-ofXxNpZbynfHF5kGKGT684H5P_tiQ50j1NxoEfX-ysif-3GVv25YW4RXPFfM82bc2ku6L5dh08lxVa9H7b6Klk_tO3Sgav6DwdWmjj9QQ7h062BFx-ICv26T6NzdLwI_9QYxiNm6lU3g5Aycm-97AMqobIxjShSPl25Yx99xhema89ZnwB_K0F7gIk86MMH1xU9-5a44-FTZ1TTv_qD533w-xg6lOcFVQhfR",
  },
  {
    id: 4,
    name: "Sweet Red Bell Pepper",
    category: "Greenhouse Estate",
    weight: "2 units",
    price: "$3.20",
    rating: 5,
    reviews: 15,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDC7hjJ81FJnujXzosLBwnZL4nAxoY0lc-NmPKY_DafjyUWuoPRQFc4YFwx--1-uo-irrvvjeCZZk7-GSZ9TTakl9Qi_4Zzg2G7i56o0b41-JUx_MmUuT7uPV4JAiHlOL6rWoUtLJv1f0sOBcLiDCy5AZL01z9wO0cLM0-MEkB9a1w23jF-JHX6mhEqDuI_u8agAm25ESXq5WZDW_mZT9F9vi-QIjNg9Kg2THCri90nWgEMv6maKsqGAHSPOvtCJQSh6SfPoNj-ICvw",
  },
  {
    id: 5,
    name: "Organic Hass Avocado",
    category: "Sicily Groves",
    weight: "3 units",
    price: "$12.00",
    rating: 5,
    reviews: 89,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkamhTltGTMMFHxDY9mW6nAKiYE0AXzvNhmSmepISnQ_e87rtr8YgHTmejzxjSCvbsWuRtnpk2yaNWr0BIH2mAuecMBMu5JKVqEIEubgy61iojBkMqRs-Rq_q5oZkTvjBH6UvjZaimj2pBj983iQt7XhFNbFvwx1Q1o5Zjvby6mzlVp56LhuRd69qEgWgOwJZIVIvtLgVNezAAkDotwmS17PEeu9n80RiDmMeqbNCFCYZlzqkcoJxETlH282jLr0a0BQubA2jsK6Ss",
    badge: "Limited Edition",
    badgeColor: "bg-primary",
    badgeTextColor: "text-white",
  },
  {
    id: 6,
    name: "Heritage Meyer Lemons",
    category: "Amalfi Coast",
    weight: "500g",
    price: "$5.50",
    rating: 4,
    reviews: 31,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIeh_lUqhtQnlLaebqvj51AihYIAJJVvU7uGGh1siaZK4QXxj4lR2nI420SKjusVo41ADhNqyjBXj2khQ2o2pFXuc5FpeE3Gdt6-GKtMEzJGYW18HB5ZYjce3H8umDJ59eoellFaOvFY_Y8X0EJxHud-WHM33vzSpxpF0tMe7ldWQgkqBXnIvvlctmAA1oaBVrhtSX0laW8GxIxWpyKSXfYpFNvmGcYqxbjAWAAn3ZJDR2KYMFZ9AHyPZpI9WMnyNnfSk-sL6HEEzA",
  },
];

export default function VegetablesPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-background-light text-primary">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm h-20" : "bg-transparent h-24"}`}>
        <div className="content-container h-full flex items-center justify-between gap-12">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-serif tracking-tight uppercase">
              ORGANIC<span className="font-light italic">ROOTS</span>
            </Link>
          </div>
          <div className="hidden md:flex flex-1 max-w-lg relative">
            <input
              className="w-full bg-white/10 border-none rounded-none py-3 px-6 pl-12 focus:ring-1 focus:ring-primary/40 text-xs tracking-wider transition-all text-primary placeholder:text-primary/50"
              placeholder="SEARCH OUR HARVEST..."
              type="text"
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 text-lg">
              search
            </span>
          </div>
          <div className="flex items-center gap-10 text-primary">
            <button className="flex items-center gap-2 hover:opacity-60 transition-opacity">
              <span className="text-[10px] tracking-widest font-semibold uppercase hidden lg:block">
                Account
              </span>
              <span className="material-symbols-outlined text-xl">person</span>
            </button>
            <button className="relative flex items-center gap-2 hover:opacity-60 transition-opacity">
              <span className="text-[10px] tracking-widest font-semibold uppercase hidden lg:block">
                My List
              </span>
              <span className="material-symbols-outlined text-xl">bookmark</span>
              <span className="absolute -top-2 -right-3 bg-primary text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                3
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Banner */}
      <section className="relative h-[450px] flex items-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img
            alt="Fresh Greens Banner"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_7_yr7tYKRtKS06sDwd0-DifqQTWayVVe76V6ScP-sOmyw5uUpG_Sp7KpnRELZ8Tv3GcQnR-goYxdRfFPQKuYX0VBq9W9HWo-RxcmkSlri6g1TS0JmO-e3bCwXsVGwafzuhnX0Jda7NajpcMSROHldOA6EqHa6V5XgOzg14qy33i1vUeUFbIaBY7UB-vjG56Bhmh8gtBSTn653UZDhMHMMkIJV4JlFllwNioKARwxpIFLO2TUZxWLR4DfllRpcqyV5tAePXSOo89g"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>
        <div className="content-container relative w-full pt-20">
          <nav className="flex items-center gap-3 text-[10px] tracking-widest uppercase text-white/60 mb-6 font-semibold">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <Link href="#" className="hover:text-white transition-colors">Shop</Link>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-white">Vegetables</span>
          </nav>
          <h1 className="text-6xl md:text-7xl font-serif text-white mb-4 italic leading-tight">
            Fresh <span className="font-normal not-italic text-frosted-blue">Vegetables</span>
          </h1>
          <p className="text-white/70 font-light max-w-xl text-sm leading-relaxed tracking-wide">
            A curated selection of seasonal produce from heritage farms, harvested at the peak of perfection and delivered with absolute freshness.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="content-container py-6 flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary/40 tracking-widest uppercase">Sort By:</span>
              <select className="filter-dropdown">
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrivals</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary/40 tracking-widest uppercase">Price Range:</span>
              <select className="filter-dropdown">
                <option>All Prices</option>
                <option>$0 - $10</option>
                <option>$10 - $25</option>
                <option>$25+</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-primary/40 tracking-widest uppercase">Sub-categories:</span>
              <select className="filter-dropdown">
                <option>All Vegetables</option>
                <option>Root Vegetables</option>
                <option>Leafy Greens</option>
                <option>Alliums & Onions</option>
                <option>Cruciferous</option>
              </select>
            </div>
          </div>
          <div className="text-[10px] tracking-widest uppercase text-slate-400 font-semibold">
            Showing 24 of 128 Products
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-background-light">
        <div className="content-container">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 shrink-0 space-y-12">
              <div>
                <span className="sidebar-label">Organic Certification</span>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input defaultChecked className="checkbox-custom" type="checkbox"/>
                    <span className="text-xs tracking-wider group-hover:text-primary transition-colors">Heritage Certified</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="checkbox-custom" type="checkbox"/>
                    <span className="text-xs tracking-wider group-hover:text-primary transition-colors">USDA Organic</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="checkbox-custom" type="checkbox"/>
                    <span className="text-xs tracking-wider group-hover:text-primary transition-colors">Biodynamic</span>
                  </label>
                </div>
              </div>
              <div>
                <span className="sidebar-label">Origin</span>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="checkbox-custom" type="checkbox"/>
                    <span className="text-xs tracking-wider group-hover:text-primary transition-colors">Local Farms (20mi)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="checkbox-custom" type="checkbox"/>
                    <span className="text-xs tracking-wider group-hover:text-primary transition-colors">European Imports</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="checkbox-custom" type="checkbox"/>
                    <span className="text-xs tracking-wider group-hover:text-primary transition-colors">Mediterranean Selection</span>
                  </label>
                </div>
              </div>
              <div>
                <span className="sidebar-label">Seasonal</span>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input defaultChecked className="checkbox-custom" type="checkbox"/>
                    <span className="text-xs tracking-wider group-hover:text-primary transition-colors">Autumn Harvest</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="checkbox-custom" type="checkbox"/>
                    <span className="text-xs tracking-wider group-hover:text-primary transition-colors">Year Round</span>
                  </label>
                </div>
              </div>
              <div className="pt-8 border-t border-slate-100">
                <button className="w-full py-4 border border-primary/10 text-[10px] tracking-widest uppercase font-bold hover:bg-primary hover:text-white transition-all">
                  Clear Filters
                </button>
              </div>
            </aside>

            {/* Products Grid */}
            <main className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                {products.map((product) => (
                  <div key={product.id} className="product-card group">
                    <div className="aspect-[4/5] bg-white mb-6 flex items-center justify-center p-12 relative overflow-hidden">
                      <img
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-1000"
                        src={product.image}
                      />
                      {product.badge && (
                        <div className={`absolute top-4 left-4 ${product.badgeColor} ${product.badgeTextColor || 'text-primary'} px-3 py-1 text-[8px] font-bold tracking-widest uppercase`}>
                          {product.badge}
                        </div>
                      )}
                    </div>
                    <div className="px-2">
                      <div className="flex items-center gap-1 mb-2 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`material-symbols-outlined text-xs ${i < product.rating ? 'fill-1' : 'fill-0'}`}>
                            star
                          </span>
                        ))}
                        <span className="text-[9px] text-slate-400 font-sans ml-1">({product.reviews})</span>
                      </div>
                      <h3 className="text-xl font-serif mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                      <p className="text-[11px] text-slate-400 font-light mb-4 tracking-wider">{product.weight} • {product.category}</p>
                      <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                        <span className="text-xl font-light">{product.price}</span>
                        <button className="btn-elegant">Add to List</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-32 flex justify-center">
                <button className="bg-primary text-white px-16 py-5 text-[11px] font-bold tracking-widest uppercase hover:bg-black transition-all">
                  Load More Selections
                </button>
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-32 bg-[#caf0f8]/30">
        <div className="content-container">
          <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden shadow-sm">
            <div className="max-w-xl text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-serif text-[#03045e] mb-6 leading-tight italic">
                We Make Your Daily Life <br/>More Easy
              </h2>
              <p className="text-slate-500 mb-10 font-light">
                Subscribe to our newsletter and enjoy with our natural organic food updates and exclusive deals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full sm:w-auto">
                  <input
                    className="w-full px-8 py-5 rounded-full border-none bg-white shadow-sm focus:ring-2 focus:ring-[#03045e]/20 text-sm font-light"
                    placeholder="Your email address"
                    type="email"
                  />
                </div>
                <button className="bg-[#03045e] text-white px-10 py-5 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors shrink-0">
                  Start Shopping
                </button>
              </div>
            </div>
            <div className="relative w-full lg:w-1/3 flex justify-center lg:justify-end">
              <div className="bg-[#fff9f0] p-10 rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500 max-w-[320px]">
                <p className="text-[10px] tracking-widest uppercase text-slate-400 text-center mb-6">
                  Daily Grocer
                </p>
                <img
                  alt="Daily Grocer Card"
                  className="w-full mb-6 mix-blend-multiply"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDC7hjJ81FJnujXzosLBwnZL4nAxoY0lc-NmPKY_DafjyUWuoPRQFc4YFwx--1-uo-irrvvjeCZZk7-GSZ9TTakl9Qi_4Zzg2G7i56o0b41-JUx_MmUuT7uPV4JAiHlOL6rWoUtLJv1f0sOBcLiDCy5AZL01z9wO0cLM0-MEkB9a1w23jF-JHX6mhEqDuI_u8agAm25ESXq5WZDW_mZT9F9vi-QIjNg9Kg2THCri90nWgEMv6maKsqGAHSPOvtCJQSh6SfPoNj-ICvw"
                />
                <p className="text-[10px] tracking-widest uppercase text-slate-400 text-center italic">
                  Minimalist Lifestyle
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white pt-32 pb-0">
        <div className="content-container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-20 mb-32">
            <div className="col-span-1 lg:col-span-1">
              <span className="text-2xl font-serif tracking-tight text-white mb-10 block uppercase">
                ORGANIC<span className="font-light italic">ROOTS</span>
              </span>
              <p className="text-slate-400 font-light leading-relaxed mb-10">
                Defining the standards of organic excellence since 1994. From heritage farms to your residence.
              </p>
              <div className="flex gap-8">
                <a className="opacity-50 hover:opacity-100 transition-opacity" href="#">
                  <span className="material-symbols-outlined font-light">public</span>
                </a>
                <a className="opacity-50 hover:opacity-100 transition-opacity" href="#">
                  <span className="material-symbols-outlined font-light">mail</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-widest uppercase mb-10">
                Collections
              </h4>
              <ul className="space-y-6 text-slate-400 text-sm font-light">
                <li><a className="hover:text-white transition-colors" href="#">Heritage Meats</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Orchard Selection</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Artisan Pantry</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Private Label</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-widest uppercase mb-10">
                Concierge
              </h4>
              <ul className="space-y-6 text-slate-400 text-sm font-light">
                <li><a className="hover:text-white transition-colors" href="#">Shipping Ethics</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Sourcing Quality</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Contact Us</a></li>
                <li><a className="hover:text-white transition-colors" href="#">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-widest uppercase mb-10">
                Newsletter
              </h4>
              <p className="text-slate-400 text-xs font-light mb-8 leading-relaxed">
                Join our inner circle for seasonal harvest updates and private offerings.
              </p>
              <div className="relative">
                <input
                  className="w-full bg-transparent border-b border-white/20 py-4 focus:border-white transition-colors outline-none text-sm placeholder-white/20"
                  placeholder="Email Address"
                  type="email"
                />
                <button className="absolute right-0 top-4 text-xs font-bold tracking-widest uppercase">
                  Join
                </button>
              </div>
            </div>
          </div>
          <div className="py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] tracking-widest text-slate-500 uppercase">
            <p>© 2024 OrganicRoots. Cultivating Excellence.</p>
            <div className="flex items-center gap-8 grayscale opacity-30">
              <img alt="Visa" className="h-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUHdLemp-vs9mQ7vv_nGJMdmZfUCTmR70QIQ0VnIcuAAbh6U5dfx9PRTb6jxXhZHxPsxNJZyh1ZfNJ-gU2kpqPR_bGtrrd-EdLpNZIlamB2SR7Ws6v84WPbl9kaduYvYkPrBpBPmhe-MOKfGaf0HMYrmhe8byMpln2aMW2EIIR8OG2RagIs8_KVFnh14wI4G0mHE9zcnW0h7SrDjI--kNIdQfbVqo02hF_XMyqa_rXshYHOZtvRlcKutcZz91BQ2ACnyF256fvDlqR"/>
              <img alt="Mastercard" className="h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjj4elOIZQMS9V8pdLswkrT2aq4fjpdvt8oZEL4VymJpUsmxcbq0m2EZsCvAYU8ycyDBNxFMla41ybfWZADQNfT3P3vRtlfy7FUYhYZEwE3zZkafDNVpn3K0WDb3Z8r0ES0hLCIprq0Elh7tVsl75T4WFXXXagkv2hAZpnklUwBj6pL_3S6OGAcrTPYvy1Y-6LFcixrg7Ab1RgeyA8Kf-d2wTH7h-t9mGXbK5Gly38a8ydpmiZcvdlOMg2r6KrzWjxco51pzrp2vSt"/>
              <img alt="Paypal" className="h-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXZ6jw03Uf7JjvFhS0fvzohceFq-L9r_p9KIkM4VYbGlNkcMZCX_QYqd0d-F-8gpHJW79gJ8xYKvV_qz1UcewYdtwAtGF2vszIXgtylOgilxSuFbuu7k1x0cxqJrsi-s2hKZTfh36ZQuVRicPo2YhVjO2sKoc8fZ6sQHkn4Yxiw4G_njDYTAF0qq1g__ww_0cSqSQ5rSGJwcE6HwyWjUMvFy-KSi1ZJ5p5BAFVex6juypyFPKxxzKGcNulcbzBqmeTYCLE9qDrMdtm"/>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
