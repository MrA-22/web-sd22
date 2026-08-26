import { motion } from "framer-motion"
import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineBookOpen,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineLogout,
  HiOutlineNewspaper
} from "react-icons/hi"

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()

  const role = localStorage.getItem("role")
  const user = JSON.parse(localStorage.getItem("user"))

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu)
  }

  const go = (path) => {
    navigate(path)
    setIsOpen(false)
  }

  const isActive = (path) => location.pathname === path

  const menuItem = (label, icon, path) => (
    <div
      onClick={() => go(path)}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition
      ${
        isActive(path)
          ? "bg-cyan-500/20 text-cyan-400"
          : "text-gray-300 hover:bg-white/10 hover:text-cyan-400"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  )

  const logout = () => {
    localStorage.clear()
    navigate("/")
  }

  return (
    <>
      {/* ================= DESKTOP ================= */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 fixed top-0 left-0 h-screen bg-black/60 backdrop-blur-xl border-r border-white/10 p-5 hidden md:flex flex-col z-40"
      >
        {/* HEADER */}
        <h1 className="text-xl font-bold text-cyan-400 mb-2">
          {role === "admin" ? "Admin Panel" : "Guru Panel"}
        </h1>

        {/* USER INFO */}
        <p className="text-xs text-gray-400 mb-6">
          {role === "guru" ? user?.nama_guru : user?.username}
        </p>

        {/* MENU */}
        <div className="flex flex-col gap-2 text-sm">

          {/* ================= ADMIN ================= */}
          {role === "admin" && (
            <>
              {menuItem("Dashboard", <HiOutlineHome />, "/adminhome")}

              {/* PROFIL */}
              <div>
                <div
                  onClick={() => toggleMenu("profil")}
                  className="flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer text-gray-300 hover:bg-white/10 hover:text-cyan-400"
                >
                  <div className="flex items-center gap-3">
                    <HiOutlineBookOpen />
                    Profil Sekolah
                  </div>
                  <span>{openMenu === "profil" ? "−" : "+"}</span>
                </div>

                {openMenu === "profil" && (
                  <div className="ml-6 mt-2 flex flex-col gap-2">
                    {menuItem("Latar Sekolah", null, "/latarsekolah")}
                  </div>
                )}
              </div>

              {/* SISWA & GURU */}
              <div>
                <div
                  onClick={() => toggleMenu("sg")}
                  className="flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer text-gray-300 hover:bg-white/10 hover:text-cyan-400"
                >
                  <div className="flex items-center gap-3">
                    <HiOutlineUserGroup />
                    Siswa & Guru
                  </div>
                  <span>{openMenu === "sg" ? "−" : "+"}</span>
                </div>

                {openMenu === "sg" && (
                  <div className="ml-6 mt-2 flex flex-col gap-2">
                    {menuItem("Data Siswa", null, "/siswapanel")}
                    {menuItem("Data Guru", null, "/gurupanel")}
                  </div>
                )}
              </div>

              {menuItem("Jadwal", <HiOutlineCalendar />, "/jadwalpanel")}
              {menuItem("Nilai", <HiOutlineChartBar />, "/nilaipanel")}
              {menuItem("Artikel", <HiOutlineNewspaper />, "/artikelpanel")}
            </>
          )}

          {/* ================= GURU ================= */}
          {role === "guru" && (
            <>
              {menuItem("Dashboard", <HiOutlineHome />, "/guru")}

              {/* 🔥 KHUSUS NILAI GURU */}
              {menuItem("Nilai Siswa", <HiOutlineChartBar />, "/nilaispanel")}
            </>
          )}

          {/* LOGOUT */}
          <div
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 mt-4 rounded-lg cursor-pointer text-red-400 hover:bg-red-500/10"
          >
            <HiOutlineLogout />
            Logout
          </div>
        </div>
      </motion.div>

      {/* ================= MOBILE NAVBAR ================= */}
      <div className="md:hidden fixed top-0 left-0 w-full z-50 bg-black/60 backdrop-blur border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-cyan-400">
            {role === "admin" ? "Admin Panel" : "Guru Panel"}
          </h1>

          <button onClick={() => setIsOpen(true)} className="text-2xl">
            <HiOutlineMenu />
          </button>
        </div>
      </div>

      {/* ================= MOBILE DRAWER ================= */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        className="fixed top-0 left-0 h-full w-72 bg-black z-50 p-6 md:hidden overflow-y-auto"
      >
        <div className="flex justify-end mb-6">
          <button onClick={() => setIsOpen(false)} className="text-2xl">
            <HiOutlineX />
          </button>
        </div>

        <div className="flex flex-col gap-3">

          {role === "admin" && (
            <>
              {menuItem("Dashboard", <HiOutlineHome />, "/adminhome")}
              {menuItem("Siswa", <HiOutlineUserGroup />, "/siswapanel")}
              {menuItem("Jadwal", <HiOutlineCalendar />, "/jadwalpanel")}
              {menuItem("Nilai", <HiOutlineChartBar />, "/nilaipanel")}
              {menuItem("Artikel", <HiOutlineNewspaper />, "/artikelpanel")}
            </>
          )}

          {role === "guru" && (
            <>
              {menuItem("Dashboard", <HiOutlineHome />, "/guru")}
              {menuItem("Nilai Siswa", <HiOutlineChartBar />, "/nilaispanel")}
            </>
          )}

          <div
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 mt-4 rounded-lg cursor-pointer text-red-400 hover:bg-red-500/10"
          >
            <HiOutlineLogout />
            Logout
          </div>
        </div>
      </motion.div>

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}