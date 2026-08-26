import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex bg-black text-white min-h-screen relative overflow-x-hidden">

      {/* SIDEBAR FIXED (Hidden di HP, Muncul otomatis di ukuran MD ke atas) */}
      <div className="hidden md:block w-64 fixed top-0 left-0 h-screen overflow-y-auto z-40 bg-black border-r border-white/10">
        <AdminSidebar />
      </div>

      {/* CONTENT (ml-0 di HP agar full layar, ml-64 di layar komputer) */}
      <div className="flex-1 w-full ml-0 md:ml-64 p-4 sm:p-6 transition-all duration-300">
        {children}
      </div>

    </div>
  );
}