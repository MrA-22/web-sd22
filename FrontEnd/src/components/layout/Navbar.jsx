import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { useState, useEffect } from "react";
import { getIdentitas } from "../../api/api";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [namaSekolah, setNamaSekolah] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getIdentitas();
        if (res) setNamaSekolah(res.nama_sekolah || "Nama Sekolah");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔥 sembunyikan semua halaman admin
  if (location.pathname.startsWith("/admin")) return null;

  const handleNav = (path) => {
    setIsOpen(false);
    if (location.pathname !== path) navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  const navItem = (label, path) => (
    <button
      onClick={() => handleNav(path)}
      className={`relative transition text-sm font-medium
        ${
          isActive(path)
            ? "text-cyan-400"
            : "text-gray-300 hover:text-cyan-400"
        }`}
    >
      {label}

      {/* underline anim */}
      {isActive(path) && (
        <motion.div
          layoutId="underline"
          className="absolute left-0 right-0 -bottom-1 h-[2px] bg-cyan-400 rounded"
        />
      )}
    </button>
  );

  return (
    <>
      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-black/50 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

          {/* LOGO */}
          <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {loading ? "Loading..." : namaSekolah}
          </h1>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex gap-8 absolute left-1/2 -translate-x-1/2">
            {navItem("Home", "/")}
            {navItem("Artikel", "/artikel")}
            {navItem("Galeri", "/galery")}
            {navItem("Kontak", "/contact")}
          </div>

          {/* BUTTON */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={() => handleNav("/loginorangtua")}
              className="px-4 py-2 text-sm border border-white/20 rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition"
            >
              Login Orang Tua
            </button>

            <button
              onClick={() => handleNav("/loginadmin")}
              className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 font-semibold hover:opacity-90 transition"
            >
              Login Admin
            </button>
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setIsOpen(true)}
          >
            <HiOutlineMenu />
          </button>
        </div>
      </motion.nav>

      {/* MOBILE DRAWER */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 90 }}
        className="fixed top-0 left-0 h-full w-72 bg-black/80 backdrop-blur-xl border-r border-white/10 z-50 p-6 md:hidden"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-lg font-bold text-cyan-400">
            Menu
          </h1>

          <button
            onClick={() => setIsOpen(false)}
            className="text-2xl hover:text-red-400 transition"
          >
            <HiOutlineX />
          </button>
        </div>

        {/* MENU */}
        <div className="flex flex-col gap-5 text-base">
          {navItem("Home", "/")}
          {navItem("Artikel", "/artikel")}
          {navItem("Galeri", "/galery")}
          {navItem("Kontak", "/contact")}
        </div>

        {/* DIVIDER */}
        <div className="border-t border-white/10 my-6" />

        {/* LOGIN */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleNav("/loginorangtua")}
            className="px-4 py-2 rounded-lg border border-white/20 hover:border-cyan-400 hover:text-cyan-400 transition"
          >
            Login Orang Tua
          </button>

          <button
            onClick={() => handleNav("/loginadmin")}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 font-semibold"
          >
            Login Admin
          </button>
        </div>
      </motion.div>

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}