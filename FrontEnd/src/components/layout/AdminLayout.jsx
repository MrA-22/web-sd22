import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex bg-black text-white min-h-screen">

      {/* SIDEBAR FIXED */}
      <div className="w-64 fixed top-0 left-0 h-screen overflow-y-auto z-40">
        <AdminSidebar />
      </div>

      {/* CONTENT */}
      <div className="flex-1 ml-64 p-6">
        {children}
      </div>

    </div>
  );
}