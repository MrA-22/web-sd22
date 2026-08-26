import { Routes, Route, useLocation } from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"

import Home from "./pages/Home"
import AdminHome from "./pages/AdminHome"
import ArtikelHome from "./pages/ArtikelHome"
import GaleryHome from "./pages/GaleryHome"
import ContactHome from "./pages/ContactHome"
import GuruHome from "./pages/GuruHome"
import LatarSekolah from "./admin/LatarSekolah"
import TambahGuru from "./admin/TambahGuru"
import TambahSiswa from "./admin/TambahSiswa"
import TambahNilai from "./admin/TambahNilai"
import TambahSNilai from "./admin/TambahSNilai"
import TambahArtikel from "./admin/TambahArtikel"
import UbahGuru from "./admin/UbahGuru"
import JadwalPanel from "./admin/JadwalPanel"
import UbahSiswa from "./admin/UbahSiswa"
import PanelGuru from "./admin/PanelGuru"
import PanelNilai from "./admin/PanelNilai"
import PanelSNilai from "./admin/PanelSNilai"
import PanelSiswa from "./admin/PanelSiswa"
import PanelArtikel from "./admin/PanelArtikel"
import LoginOrangTua from "./pages/LoginOrangTua"
import OrangTua from "./pages/OrangTua"
import LoginAdmin from "./pages/LoginAdmin"
import DetailArtikel from "./pages/DetailArtikel"
import UbahArtikel from "./admin/UbahArtikel"

export default function App() {
  const location = useLocation()

  // halaman admin atau lainnya yang TIDAK pakai navbar
  const hideNavbarRoutes = [
    "/adminhome",
    "/guru",
    "/latarsekolah",
    "/gurupanel",
    "/addguru",
    "/addsnilai",
    "/ubahguru",
    "/siswapanel",
    "/ubahsiswa",
    "/jadwalpanel",
    "/nilaipanel",
    "/nilaispanel",
    "/artikelpanel",
    "/addnilai",
    "/addartikel",
    "/ubahartikel",
  ]

  const hideNavbar = hideNavbarRoutes.some(route =>
    location.pathname.startsWith(route)
  )

  return (
    <div className="bg-gray-950 text-white min-h-screen">

      {/* Navbar hanya tampil kalau bukan halaman admin */}
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/adminhome" element={<AdminHome />} />
        <Route path="/artikel" element={<ArtikelHome />} />
        <Route path="/galery" element={<GaleryHome />} />
        <Route path="/contact" element={<ContactHome />} />
        <Route path="/guru" element={<GuruHome />} />
        <Route path="/latarsekolah" element={<LatarSekolah />} />
        <Route path="/addguru" element={<TambahGuru />} />
        <Route path="/addsiswa" element={<TambahSiswa />} />
        <Route path="/addnilai" element={<TambahNilai />} />
        <Route path="/addsnilai" element={<TambahSNilai />} />
        <Route path="/addartikel" element={<TambahArtikel />} />
        <Route path="/ubahguru/:id" element={<UbahGuru />} />
        <Route path="/ubahsiswa/:id" element={<UbahSiswa />} />
        <Route path="/gurupanel" element={<PanelGuru />} />
        <Route path="/siswapanel" element={<PanelSiswa />} />
        <Route path="/nilaipanel" element={<PanelNilai />} />
        <Route path="/nilaispanel" element={<PanelSNilai />} />
        <Route path="/artikelpanel" element={<PanelArtikel />} />
        <Route path="/jadwalpanel" element={<JadwalPanel />} />
        <Route path="/loginorangtua" element={<LoginOrangTua />} />
        <Route path="/orangtua" element={<OrangTua />} />
        <Route path="/loginadmin" element={<LoginAdmin />} />
        <Route path="/artikel/:id" element={<DetailArtikel />} />
        <Route path="/ubahartikel/:id" element={<UbahArtikel />} />
      </Routes>

      {/* Footer juga bisa disembunyikan kalau mau */}
      {!hideNavbar && <Footer />}
    </div>
  )
}