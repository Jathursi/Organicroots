"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CategoryManagement from "@/components/admin/CategoryManagement";

const menuItems = [
  "dashboard",
  "user contents",
  "category",
  "products",
  "flash sales",
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
    if (activeMenu === "user contents") {
      return "User Contents";
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
    "flash sales": "bolt",
    "user role": "manage_accounts",
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
    const loadSliderImages = async () => {
      try {
        const response = await fetch("/api/admin/hero-slider", { cache: "no-store" });
        const data = (await response.json()) as { images?: string[] };

        if (response.status === 401 || response.status === 403) {
          router.push("/");
          return;
        }

        if (!response.ok) {
          return;
        }

        setSliderImages(data.images ?? []);
      } catch {
        return;
      }
    };

    void loadSliderImages();

    const loadSingleAsset = async (
      key: "seedToPlateVideo" | "freeDeliveryImage" | "dailyGrocerImage" | "handmadeProductsImage",
      setter: (value: string[]) => void
    ) => {
      try {
        const response = await fetch(`/api/admin/user-content/${key}`, { cache: "no-store" });
        const data = (await response.json()) as { asset?: { url: string } | null };

        if (!response.ok) {
          return;
        }

        if (data.asset?.url) {
          setter([data.asset.url]);
        }
      } catch {
        return;
      }
    };

    void loadSingleAsset("seedToPlateVideo", setSeedVideo);
    void loadSingleAsset("freeDeliveryImage", setFreeDeliveryImage);
    void loadSingleAsset("dailyGrocerImage", setDailyGrocerImage);
    void loadSingleAsset("handmadeProductsImage", setHandmadeProductsImage);
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
    <main className="bg-background-light text-slate-800 min-h-screen flex">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
        <div className="p-8">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-primary uppercase">ORGANIC<span className="font-light italic">ROOTS</span></h1>
          <span className="text-[9px] tracking-[0.3em] uppercase text-primary/40 font-bold block mt-1">Admin Console</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${activeMenu === item
                ? "bg-primary text-white font-semibold shadow-lg shadow-primary/20"
                : item === "logout"
                  ? "text-red-500 hover:bg-red-50"
                  : "text-slate-600 hover:bg-light-cyan/50"
                }`}
              key={item}
              onClick={() => {
                void handleMenuClick(item);
              }}
              type="button"
            >
              <span className="material-symbols-outlined mr-3">{menuIconMap[item]}</span>
              {item
                .split(" ")
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ")}
            </button>
          ))}
        </nav>
      </aside>

      <section className="flex-1 ml-72">
        <header className="h-16 flex items-center justify-between px-10 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200">
          <div className="flex items-center space-x-2 text-xs font-semibold tracking-widest text-slate-400 uppercase">
            <span>Organic Roots</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary">Admin Panel</span>
          </div>

          <div className="flex items-center space-x-6">
            <button className="text-slate-500 hover:text-primary transition-colors" type="button">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="flex items-center space-x-3 border-l pl-6 border-slate-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800 leading-none">Admin User</p>
                <p className="text-[10px] text-slate-500 uppercase mt-1">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-6xl mx-auto">
          <div className="mb-10">
            <h2 className="font-serif text-5xl font-bold text-primary">{pageTitle}</h2>
            <p className="text-slate-500 mt-2">Manage the visual elements of your storefront.</p>
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
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <p className="text-slate-500">This section is ready for next setup.</p>
            </div>
          )}
        </div>

        <div className="fixed bottom-8 right-8 flex flex-col space-y-4">
          <button className="w-12 h-12 bg-white border border-slate-200 rounded-full shadow-xl flex items-center justify-center text-primary hover:scale-110 transition-transform" type="button">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="w-12 h-12 bg-primary rounded-full shadow-xl flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[22px]">smart_toy</span>
          </div>
        </div>
      </section>
    </main>
  );
}
