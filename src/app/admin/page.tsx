"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CategoryManagement from "@/components/admin/CategoryManagement";
import ProductManagement from "@/components/admin/ProductManagement";
import TeamManagement from "@/components/admin/TeamManagement";
import FlashSaleManagement from "@/components/admin/FlashSaleManagement";
import OfferManagement from "@/components/admin/OfferManagement";
import CollectionManagement from "@/components/admin/CollectionManagement";

const menuItems = [
  "dashboard",
  "user contents",
  "category",
  "products",
  "collections", // Added collections
  "flash sales",
  "offers",
  "user role",
  "account",
  "logout",
] as const;

type MenuItem = (typeof menuItems)[number];

type UploadCardProps = {
  title: string;
  accept: string;
  multiple?: boolean;
  helper: string;
  uploadedFiles: string[];
  previewAsImage?: boolean;
  previewAsVideo?: boolean;
  icon: string;
  fileHint: string;
  buttonLabel: string;
  badge?: string;
  onFilesSelected: (files: FileList | null) => void;
};

function UploadCard({
  title,
  accept,
  multiple = false,
  helper,
  uploadedFiles,
  previewAsImage = false,
  previewAsVideo = false,
  icon,
  fileHint,
  buttonLabel,
  badge,
  onFilesSelected,
}: UploadCardProps) {
  return (
    <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-3xl font-serif text-primary">{title}</h3>
          <p className="text-slate-500 text-sm mt-1">{helper}</p>
        </div>
        {badge && (
          <span className="text-xs font-bold text-primary bg-light-cyan/50 px-3 py-1 rounded-full uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>

      <label className="block rounded-xl border-2 border-dashed border-frosted-blue p-12 text-center cursor-pointer transition-all hover:border-primary hover:bg-light-cyan/20 bg-slate-50">
        <span className="w-16 h-16 rounded-full bg-light-cyan/40 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
        </span>
        <span className="block text-lg font-medium text-slate-700 mb-1">Drag & drop a file to upload</span>
        <span className="block text-sm text-slate-400 mb-6">{fileHint}</span>
        <span className="inline-flex items-center justify-center bg-white border border-slate-200 text-primary px-8 py-2.5 rounded-lg font-semibold text-sm hover:shadow-md transition-all active:scale-95">
          {buttonLabel}
        </span>
        <input
          accept={accept}
          className="hidden"
          multiple={multiple}
          onChange={(event) => onFilesSelected(event.target.files)}
          type="file"
        />
      </label>

      {uploadedFiles.length > 0 && (
        previewAsVideo ? (
          <div className="mt-6 grid grid-cols-1 gap-4">
            {uploadedFiles.map((file) => (
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50" key={file}>
                <video className="w-full h-[280px] object-cover" controls preload="metadata">
                  <source src={file} />
                </video>
              </div>
            ))}
          </div>
        ) : previewAsImage ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {uploadedFiles.map((file) => (
              <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-50" key={file}>
                <img alt="Uploaded slider preview" className="w-full h-full object-cover" src={file} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {uploadedFiles.map((file) => (
              <div className="rounded-lg border border-slate-200 px-4 py-3 bg-slate-50 text-sm text-slate-700" key={file}>{file}</div>
            ))}
          </div>
        )
      )}
    </section>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<MenuItem>("user contents");
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [seedVideo, setSeedVideo] = useState<string[]>([]);
  const [freeDeliveryImage, setFreeDeliveryImage] = useState<string[]>([]);
  const [dailyGrocerImage, setDailyGrocerImage] = useState<string[]>([]);
  const [handmadeProductsImage, setHandmadeProductsImage] = useState<string[]>([]);
  const [uploadMessage, setUploadMessage] = useState<string>("");

  const pageTitle = useMemo(() => {
    if (activeMenu === "user role") {
      return "Team & Role Management";
    }

    return activeMenu
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }, [activeMenu]);

  const menuIconMap: Record<MenuItem, string> = {
    dashboard: "dashboard",
    "user contents": "collections",
    category: "category",
    products: "inventory_2",
    collections: "grid_view", // Added collections icon
    "flash sales": "bolt",
    offers: "redeem",
    "user role": "admin_panel_settings",
    account: "person",
    logout: "logout",
  };

  const handleMenuClick = async (item: MenuItem) => {
    if (item === "logout") {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      return;
    }

    setActiveMenu(item);
  };

  useEffect(() => {
    const loadDashboardContent = async () => {
      try {
        const response = await fetch("/api/admin/all-site-content", { cache: "no-store" });
        const data = (await response.json()) as {
          heroImages?: string[];
          siteAssets?: Record<string, string>
        };

        if (response.status === 401 || response.status === 403) {
          router.push("/");
          return;
        }

        if (!response.ok || !data) return;

        if (data.heroImages) setSliderImages(data.heroImages);
        if (data.siteAssets) {
          if (data.siteAssets.seedToPlateVideo) setSeedVideo([data.siteAssets.seedToPlateVideo]);
          if (data.siteAssets.freeDeliveryImage) setFreeDeliveryImage([data.siteAssets.freeDeliveryImage]);
          if (data.siteAssets.dailyGrocerImage) setDailyGrocerImage([data.siteAssets.dailyGrocerImage]);
          if (data.siteAssets.handmadeProductsImage) setHandmadeProductsImage([data.siteAssets.handmadeProductsImage]);
        }
      } catch (err) {
        console.error("Failed to load dashboard content", err);
      }
    };

    void loadDashboardContent();
  }, [router]);

  const uploadSliderImages = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    setUploadMessage("");

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/admin/hero-slider", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { images?: string[]; error?: string; message?: string };

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push("/");
          return;
        }

        setUploadMessage(data.error ?? "Upload failed.");
        return;
      }

      setSliderImages((prev) => [...(data.images ?? []), ...prev]);
      setUploadMessage(data.message ?? "Images uploaded.");
    } catch {
      setUploadMessage("Upload failed.");
    }
  };

  const uploadSingleAsset = async (
    key: "seedToPlateVideo" | "freeDeliveryImage" | "dailyGrocerImage" | "handmadeProductsImage",
    files: FileList | null,
    setter: (value: string[]) => void
  ) => {
    if (!files || files.length === 0) {
      return;
    }

    setUploadMessage("");

    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const response = await fetch(`/api/admin/user-content/${key}`, {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { asset?: { url: string }; error?: string; message?: string };

      if (!response.ok) {
        setUploadMessage(data.error ?? "Upload failed.");
        return;
      }

      setter(data.asset?.url ? [data.asset.url] : []);
      setUploadMessage(data.message ?? "Upload successful.");
    } catch {
      setUploadMessage("Upload failed.");
    }
  };

  return (
    <main className="bg-[#f0f7ff]/40 text-slate-800 min-h-screen flex">
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col fixed h-full z-50">
        <div className="p-10 mb-2">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#03045e] uppercase leading-none">
            ORGANIC<span className="font-light italic">ROOTS</span>
          </h1>
          <span className="text-[9px] tracking-[0.2em] uppercase text-slate-400 font-bold block mt-2">
            Admin Console
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6">
          {menuItems.map((item) => {
            const isActive = activeMenu === item;
            return (
              <button
                className={`w-full flex items-center px-6 py-3.5 text-[11px] font-bold tracking-widest uppercase rounded-lg transition-all duration-300 ${isActive
                  ? "bg-[#03045e] text-white shadow-xl shadow-[#03045e]/20 translate-x-1"
                  : item === "logout"
                    ? "text-red-500 hover:bg-red-50"
                    : "text-slate-400 hover:text-[#03045e] hover:bg-slate-50"
                  }`}
                key={item}
                onClick={() => {
                  void handleMenuClick(item);
                }}
                type="button"
              >
                <span className={`material-symbols-outlined mr-4 text-xl ${isActive ? "text-white" : "text-slate-400"}`}>
                  {menuIconMap[item]}
                </span>
                <span className="truncate">
                  {item === "user contents" ? "User Contents" :
                    item === "user role" ? "User Role" :
                      item === "flash sales" ? "Flash Sales" :
                        item === "offers" ? "Special Offers" :
                          item.charAt(0).toUpperCase() + item.slice(1)}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-8 border-t border-slate-50 flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[#03045e] font-bold text-xs ring-4 ring-slate-50/50">A</div>
          <div>
            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">Julian de'Rossi</p>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Master Admin</p>
          </div>
        </div>
      </aside>

      <section className="flex-1 ml-72">
        <header className="h-20 flex items-center justify-between px-10 bg-white sticky top-0 z-40 border-b border-slate-100 shadow-sm/50">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative max-w-xl w-full">
              <input
                className="w-full bg-slate-50 border-none rounded-none py-2.5 px-10 text-[10px] tracking-[0.15em] font-medium placeholder:text-slate-400 focus:ring-1 focus:ring-primary/10 uppercase"
                placeholder="SEARCH..."
                type="text"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            </div>
          </div>

          <div className="flex items-center gap-8 border-l border-slate-100 pl-8 ml-8">
            <button className="relative p-2 text-slate-400 hover:text-primary transition-colors" type="button">
              <span className="material-symbols-outlined text-2xl">notifications</span>
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-800 uppercase leading-none">Admin User</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">SUPER ADMIN</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#03045e] flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-[#03045e]/20">
                A
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="font-serif text-5xl font-bold text-primary tracking-tight">{pageTitle}</h2>
            <p className="text-slate-400 mt-3 text-xs uppercase tracking-[0.2em] font-medium">
              {activeMenu === "user role" ? "Manage administrative access and assign roles to team members" :
                activeMenu === "products" ? "Manage inventories, pricing, and display status" :
                  "Manage the visual elements of your storefront."}
            </p>
          </div>

          {activeMenu === "user contents" ? (
            <div className="grid gap-8">
              <UploadCard
                accept="image/*"
                buttonLabel="Choose File"
                fileHint="PNG, JPG or WEBP (Max 2MB)"
                helper="Add or replace high-resolution images for the homepage hero carousel."
                icon="cloud_upload"
                multiple
                previewAsImage
                onFilesSelected={(files) => {
                  void uploadSliderImages(files);
                }}
                title="Upload Slider Images"
                uploadedFiles={sliderImages}
              />

              {uploadMessage && (
                <p className="text-sm text-primary/80 -mt-4">{uploadMessage}</p>
              )}

              <UploadCard
                accept="video/*"
                badge="MP4 / MOV"
                buttonLabel="Select Video"
                fileHint="Maximum file size: 50MB"
                helper="Upload educational and promotional videos showcasing the product journey."
                icon="movie_filter"
                previewAsVideo
                onFilesSelected={(files) => {
                  void uploadSingleAsset("seedToPlateVideo", files, setSeedVideo);
                }}
                title="Upload Videos (From Seed to Plate)"
                uploadedFiles={seedVideo}
              />

              <UploadCard
                accept="image/*"
                buttonLabel="Choose File"
                fileHint="PNG, JPG or WEBP (Max 2MB)"
                helper="Upload image for Free Delivery section."
                icon="collections"
                previewAsImage
                onFilesSelected={(files) => {
                  void uploadSingleAsset("freeDeliveryImage", files, setFreeDeliveryImage);
                }}
                title="Upload Free Delivery Image"
                uploadedFiles={freeDeliveryImage}
              />

              <UploadCard
                accept="image/*"
                buttonLabel="Choose File"
                fileHint="PNG, JPG or WEBP (Max 2MB)"
                helper="Upload image for Daily Grocer card."
                icon="collections"
                previewAsImage
                onFilesSelected={(files) => {
                  void uploadSingleAsset("dailyGrocerImage", files, setDailyGrocerImage);
                }}
                title="Upload Daily Grocer Image"
                uploadedFiles={dailyGrocerImage}
              />

              <UploadCard
                accept="image/*"
                buttonLabel="Choose File"
                fileHint="PNG, JPG or WEBP (Max 2MB)"
                helper="Upload image for Handmade Products section."
                icon="collections"
                previewAsImage
                onFilesSelected={(files) => {
                  void uploadSingleAsset("handmadeProductsImage", files, setHandmadeProductsImage);
                }}
                title="Upload Handmade Products Image"
                uploadedFiles={handmadeProductsImage}
              />
            </div>
          ) : activeMenu === "category" ? (
            <CategoryManagement />
          ) : activeMenu === "products" ? (
            <ProductManagement />
          ) : activeMenu === "collections" ? ( // Added collections management
            <CollectionManagement />
          ) : activeMenu === "flash sales" ? (
            <FlashSaleManagement />
          ) : activeMenu === "offers" ? (
            <OfferManagement />
          ) : activeMenu === "user role" ? (
            <TeamManagement />
          ) : (
            <div className="bg-white rounded-none p-12 border border-slate-100 shadow-sm text-center">
              <span className="material-symbols-outlined text-4xl text-slate-100 mb-4 block">construction</span>
              <p className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">This section is being drafted.</p>
            </div>
          )}
        </div>

        <div className="fixed bottom-8 right-8 flex flex-col space-y-4 z-50">
          <button className="w-12 h-12 bg-white border border-slate-100 rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-primary hover:scale-110 transition-all duration-300" type="button">
            <span className="material-symbols-outlined text-2xl">help</span>
          </button>
          <div className="w-12 h-12 bg-[#03045e] rounded-full shadow-xl flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-all duration-300 border-4 border-white">
            <span className="material-symbols-outlined text-[24px]">smart_toy</span>
          </div>
        </div>
      </section>
    </main>
  );
}
